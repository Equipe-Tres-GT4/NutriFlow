/** Enriquecimento de mídias: busca fotos reais de alimentos em Commons, salva URL e crédito.
 * Não modifica receita ou imagem de usuários reais. Repetível sem apagar dados.
 * Execute depois de db:seed:demo. Se houver falha de rede, preserva as fotos existentes.
 */
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Op } from 'sequelize'
import { Usuario, Receita, Publicacao, ReceitaSalva, sequelize } from './models.js'
import { executarMigracoes } from './migrations.js'
import { termosPorReceita, buscarFotoCommons } from './media-commons.js'

const pastaMidia = resolve(process.env.MEDIA_STORAGE || 'uploads')
const localPelaExt = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
async function guardarFotoAberta(url, fetcher) {
  const resposta = await fetcher(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'NutriFlowAcademicDemo/1.0 (license-aware media download)' } })
  if (!resposta.ok) throw new Error(`Download HTTP ${resposta.status}`)
  const mime = String(resposta.headers?.get?.('content-type') || '').split(';')[0]
  const ext = localPelaExt[mime]
  if (!ext) throw new Error('Formato de fotografia não reconhecido')
  const bytes = Buffer.from(await resposta.arrayBuffer())
  if (bytes.length < 1000 || bytes.length > 6_000_000) throw new Error('Foto fora do limite de 1 KB–6 MB')
  if (ext === 'jpg' && !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)) throw new Error('Assinatura JPEG inválida')
  if (ext === 'png' && !(bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71)) throw new Error('Assinatura PNG inválida')
  if (ext === 'webp' && bytes.toString('ascii',8,12) !== 'WEBP') throw new Error('Assinatura WebP inválida')
  await mkdir(pastaMidia, { recursive: true })
  const nome = `${randomUUID()}.${ext}`
  await writeFile(resolve(pastaMidia, nome), bytes, { flag: 'wx', mode: 0o600 })
  return `/api/media/${nome}`
}


export async function enriquecerMidiasDemo({ fetcher = fetch, logger = console } = {}) {
  await executarMigracoes(sequelize)
  const perfis = await Usuario.findAll({ where: { isDemo: true }, attributes: ['id'] })
  if (!perfis.length) return { atualizadas: 0, avisos: ['Execute db:seed:demo antes.'] }
  const receitas = await Receita.findAll({ where: { autorId: { [Op.in]: perfis.map(p => p.id) } }, order: [['id','ASC']] })
  const usadas = new Set()
  const avisos = []
  let atualizadas = 0
  // Consultas de foto concorrentes; escritas SQLite sequenciais para evitar SQLITE_BUSY.
  for (let inicio = 0; inicio < receitas.length; inicio += 4) {
    const resultados = await Promise.all(receitas.slice(inicio, inicio + 4).map(async receita => {
      if (receita.fotoCredito && receita.imagemUrl) { usadas.add(receita.imagemUrl); return null }
      const termo = termosPorReceita[receita.nome]
      if (!termo) return null
      try {
        const foto = await buscarFotoCommons(termo, { fetcher, usados: usadas, timeout: 7500 })
        if (!foto) { avisos.push(`Sem foto aberta identificada para: ${receita.nome}`); return null }
        return { receita, foto }
      } catch (e) { avisos.push(`${receita.nome}: ${e.message}`); return null }
    }))
    for (const resultado of resultados.filter(Boolean)) {
      const { receita, foto } = resultado
      if (usadas.has(foto.url)) continue
      usadas.add(foto.url)
      try {
        let urlFoto = foto.url
        try { urlFoto = await guardarFotoAberta(foto.url, fetcher) }
        catch (e) { avisos.push(`Imagem mantida por URL externa (${receita.nome}): ${e.message}`) }
        await sequelize.transaction(async transaction => {
          await receita.update({ imagemUrl: urlFoto, fotoCredito: JSON.stringify({ fonte: 'Wikimedia Commons', url: foto.fonteUrl, autor: foto.autor, licenca: foto.licenca, ilustrativa: true }) }, { transaction })
          await Publicacao.update({ imagemUrl: urlFoto }, { where: { receitaId: receita.id }, transaction })
          await ReceitaSalva.update({ imagemUrl: urlFoto }, { where: { chave: `local:${receita.id}` }, transaction })
        })
        atualizadas++
        logger.info?.(`Foto: ${receita.nome} (${foto.licenca})`)
      } catch (e) { avisos.push(`${receita.nome}: ${e.message}`) }
    }
  }
  return { atualizadas, totalReceitas: receitas.length, avisos }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    await sequelize.authenticate()
    const resumo = await enriquecerMidiasDemo()
    console.log('NutriFlow — fotos reais:', resumo)
    if (resumo.avisos.length) console.log('Confira os avisos e créditos antes da apresentação.')
  } catch (e) { console.error('Falha:', e.message); process.exitCode = 1 }
  finally { await sequelize.close() }
}
