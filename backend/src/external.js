import { getJson } from './httpClient.js'
import { normalizarProduto, normalizarRefeicao, normalizarEndereco, somenteDigitos } from './normalize.js'
import { ESTADOS_BRASIL, ordenarEstados, validarEstados } from './localidades.js'

export const fontes = [
  { id: 'openfoodfacts', nome: 'Open Food Facts', finalidade: 'Rótulos, códigos de barras e dados nutricionais', licenca: 'ODbL (dados); atribuição e compartilhamento conforme termos', documento: 'https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/', limite: 'Busca: 10/min/IP; produto: 15/min/IP; cache local' },
  { id: 'themealdb', nome: 'TheMealDB', finalidade: 'Receitas internacionais e ingredientes', licenca: 'Chave 1 somente para desenvolvimento/educação; produção requer chave adequada', documento: 'https://www.themealdb.com/docs_api_guide.php', limite: 'Depende da modalidade' },
  { id: 'viacep', nome: 'ViaCEP', finalidade: 'Autocompletar endereços por CEP', licenca: 'Serviço público gratuito, sujeito a políticas de uso', documento: 'https://viacep.com.br/', limite: 'Evitar uso massivo' },
  { id: 'brasilapi', nome: 'BrasilAPI', finalidade: 'Fallback de CEP', licenca: 'API pública comunitária; serviço sujeito a disponibilidade', documento: 'https://brasilapi.com.br/docs', limite: 'Evitar requisições excessivas' },
  { id: 'ibge', nome: 'IBGE Localidades', finalidade: 'Listar UFs e municípios para perfil', licenca: 'Dados públicos do IBGE; citar a fonte', documento: 'https://servicodados.ibge.gov.br/api/docs/localidades', limite: 'Cache de 24 horas' },
]
const cache = new Map()
const offRequests = []
export class ErroExterno extends Error { constructor(mensagem, status = 502) { super(mensagem); this.status = status } }
async function consultar(url, { ttl = 300_000, limiteOff = false, headers = {}, timeout = 7_000 } = {}) {
  const chave = String(url)
  const salvo = cache.get(chave)
  if (salvo && salvo.expira > Date.now()) return salvo.dados
  if (limiteOff) {
    const agora = Date.now()
    while (offRequests.length && offRequests[0] <= agora - 60_000) offRequests.shift()
    if (offRequests.length >= 8) throw new ErroExterno('Limite de consultas ao Open Food Facts atingido. Tente em um minuto.', 429)
    offRequests.push(agora)
  }
  let resposta
  try { resposta = await getJson(url, { timeout, headers }) }
  catch { throw new ErroExterno('O serviço externo está indisponível ou demorou a responder.', 503) }
  if (resposta.status === 404) throw new ErroExterno('Registro não encontrado.', 404)
  if (resposta.status < 200 || resposta.status >= 300) throw new ErroExterno('Serviço externo retornou HTTP ' + resposta.status)
  const dados = resposta.data
  if (typeof dados !== 'object' || dados === null) throw new ErroExterno('Resposta inválida do serviço externo.')
  // cache limitado para evitar crescimento indefinido
  if (cache.size > 300) cache.clear()
  cache.set(chave, { dados, expira: Date.now() + ttl })
  return dados
}
function offAgent() { return process.env.OPENFOODFACTS_USER_AGENT || 'NutriFlow/1.0 (https://github.com/Equipe-Tres-GT4/NutriFlow)' }
export async function produtoPorCodigo(codigo) {
  const d = await consultar(`https://world.openfoodfacts.org/api/v3/product/${codigo}?fields=code,product_name,product_name_pt,brands,image_front_small_url,image_url,ingredients_text,ingredients_text_pt,allergens,nutriscore_grade,nutriments`, { ttl: 24 * 3600_000, limiteOff: true, headers: { 'User-Agent': offAgent() } })
  if (!d.product) throw new ErroExterno('Produto não encontrado.', 404)
  return normalizarProduto(d.product)
}
export async function buscarProdutos(termo) {
  // Consulta textual legada documentada pelo fornecedor; a busca estruturada v2 não é textual.
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl')
  Object.entries({ search_terms: termo, search_simple: '1', action: 'process', json: '1', page_size: '12', fields: 'code,product_name,product_name_pt,brands,image_front_small_url,nutriments,nutriscore_grade' }).forEach(([k, v]) => url.searchParams.set(k, v))
  const d = await consultar(url, { ttl: 15 * 60_000, limiteOff: true, headers: { 'User-Agent': offAgent() } })
  return (d.products || []).map(normalizarProduto)
}
export async function buscarReceitas(termo) {
  const chave = process.env.THEMEALDB_KEY || '1'
  const d = await consultar(`https://www.themealdb.com/api/json/v1/${encodeURIComponent(chave)}/search.php?s=${encodeURIComponent(termo)}`, { ttl: 15 * 60_000 })
  return (d.meals || []).map(normalizarRefeicao)
}
export async function receitaPorId(id) {
  const chave = process.env.THEMEALDB_KEY || '1'
  const d = await consultar(`https://www.themealdb.com/api/json/v1/${encodeURIComponent(chave)}/lookup.php?i=${id}`, { ttl: 30 * 60_000 })
  const receita = normalizarRefeicao(d.meals?.[0]); if (!receita) throw new ErroExterno('Receita não encontrada.', 404)
  return receita
}
export async function receitaAleatoria() {
  const chave = process.env.THEMEALDB_KEY || '1'
  const d = await consultar(`https://www.themealdb.com/api/json/v1/${encodeURIComponent(chave)}/random.php`, { ttl: 0 })
  return normalizarRefeicao(d.meals?.[0])
}
export async function enderecoPorCep(cep) {
  const c = somenteDigitos(cep)
  try {
    const d = await consultar(`https://viacep.com.br/ws/${c}/json/`, { ttl: 24 * 3600_000 })
    if (d.erro) throw new ErroExterno('CEP não encontrado.', 404)
    return normalizarEndereco(d, 'ViaCEP')
  } catch (err) {
    if (err.status === 404) throw err
    const d = await consultar(`https://brasilapi.com.br/api/cep/v2/${c}`, { ttl: 24 * 3600_000 })
    return normalizarEndereco(d, 'BrasilAPI (fallback)')
  }
}
// O formulário não pode ficar sem UFs por um problema de rede no IBGE.
// O cliente continua consultando a nossa API; o backend tenta a fonte oficial primeiro.
let usarEstadosLocaisAte = 0
export async function listarEstadosComFonte() {
  if (Date.now() < usarEstadosLocaisAte) {
    return { estados: ordenarEstados(ESTADOS_BRASIL), fonte: 'Lista local baseada no IBGE', modoReserva: true }
  }
  try {
    const dados = await consultar('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome', {
      ttl: 24 * 3600_000, timeout: 2500,
    })
    const estados = dados.map(uf => ({ sigla: uf.sigla, nome: uf.nome, id: uf.id }))
    if (!validarEstados(estados)) throw new Error('Resposta de UFs incompleta')
    return { estados: ordenarEstados(estados), fonte: 'IBGE Localidades', modoReserva: false }
  } catch {
    usarEstadosLocaisAte = Date.now() + 5 * 60_000 // evita atrasar cada formulário em caso de falha externa
    return { estados: ordenarEstados(ESTADOS_BRASIL), fonte: 'Lista local baseada no IBGE', modoReserva: true }
  }
}
export async function listarEstados() {
  return (await listarEstadosComFonte()).estados
}
export async function listarCidadesComFonte(uf) {
  try {
    const dados = await consultar(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`, {
      ttl: 24 * 3600_000, timeout: 4000,
    })
    if (!Array.isArray(dados)) throw new Error('Resposta de municípios inválida')
    return {
      cidades: dados.map(c => ({ id: c.id, nome: c.nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
      fonte: 'IBGE Localidades', modoManual: false,
    }
  } catch {
    // Município é campo livre nos dois formulários; nunca bloquear cadastro quando IBGE cair.
    return { cidades: [], fonte: 'Consulta ao IBGE indisponível', modoManual: true }
  }
}
export async function listarCidades(uf) {
  return (await listarCidadesComFonte(uf)).cidades
}
