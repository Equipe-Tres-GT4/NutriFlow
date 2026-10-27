import { receitas } from '../data/receitas'

export const PREFERENCIAS = [
  { id: 'gluten', rotulo: 'Sem glúten', icone: 'bi-slash-circle', descricao: 'Evitar preparações com glúten' },
  { id: 'lactose', rotulo: 'Sem lactose', icone: 'bi-droplet', descricao: 'Evitar preparações com lactose' },
  { id: 'vegetariano', rotulo: 'Vegetariano', icone: 'bi-flower1', descricao: 'Sem carne ou peixe' },
  { id: 'vegano', rotulo: 'Vegano', icone: 'bi-heart', descricao: 'Sem ingredientes de origem animal' },
]

const IMAGENS = {
  1: '/panqueca.jpg',
  2: '/coxinha-de-batata.avif',
  3: '/bolo-de-milho.jpg',
  4: '/paosemgluten.png',
  5: '/boloCenoura.jpg',
  6: '/brigadeiro.webp',
}

export const receitasIniciais = receitas.map((receita) => ({
  ...receita,
  id: `receita-${receita.id}`,
  imagem: IMAGENS[receita.id] || '/receita.jpg',
  autor: 'Equipe NutriFlow',
  origem: 'editorial',
  publicadoEm: receita.dataCadastro,
}))

export function primeiraPalavra(nome = '') {
  return nome.trim().split(/\s+/)[0] || 'visitante'
}

export function iniciais(nome = '') {
  return nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join('') || 'NF'
}

export function resumoRestricoes(receita) {
  const r = receita.restricoes || {}
  const etiquetas = []
  if (r.contemGluten === false) etiquetas.push('Sem glúten*')
  if (r.contemLactose === false) etiquetas.push('Sem lactose*')
  if (r.vegano === true) etiquetas.push('Vegano*')
  else if (r.vegetariano === true) etiquetas.push('Vegetariano*')
  return etiquetas
}

// Valores ausentes NÃO significam 'seguro': filtros usam informações explicitamente preenchidas.
export function atendePreferencias(receita, filtros) {
  const r = receita.restricoes || {}
  return filtros.every((filtro) => {
    if (filtro === 'gluten') return r.contemGluten === false
    if (filtro === 'lactose') return r.contemLactose === false
    if (filtro === 'vegetariano') return r.vegetariano === true || r.vegano === true
    if (filtro === 'vegano') return r.vegano === true
    return true
  })
}

export function filtrarReceitas(lista, busca = '', filtros = [], categoria = 'Todas') {
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  return lista.filter((receita) => {
    const pesquisa = [receita.nome, receita.descricao, receita.categoria, ...(receita.ingredientes || [])].join(' ').toLocaleLowerCase('pt-BR')
    return (!termo || pesquisa.includes(termo)) && (categoria === 'Todas' || receita.categoria === categoria) && atendePreferencias(receita, filtros)
  })
}

export function validarReceita(form) {
  const nome = (form.nome || '').trim()
  const descricao = (form.descricao || '').trim()
  const ingredientes = (form.ingredientes || '').split(/\r?\n/).map((linha) => linha.trim()).filter(Boolean)
  const passos = (form.modoPreparo || '').split(/\r?\n/).map((linha) => linha.trim()).filter(Boolean)
  const minutos = Number(form.minutos)
  const porcoes = Number(form.porcoes)
  if (nome.length < 5 || nome.length > 90) return 'O nome deve ter entre 5 e 90 caracteres.'
  if (descricao.length < 20 || descricao.length > 500) return 'A descrição deve ter entre 20 e 500 caracteres.'
  if (ingredientes.length < 2 || ingredientes.length > 30 || ingredientes.some((i) => i.length > 140)) return 'Adicione de 2 a 30 ingredientes (um por linha, até 140 caracteres cada).'
  if (passos.length < 2 || passos.length > 25 || passos.some((p) => p.length > 400)) return 'Adicione de 2 a 25 etapas (uma por linha, até 400 caracteres cada).'
  if (!Number.isInteger(minutos) || minutos < 1 || minutos > 1440) return 'Informe um tempo de preparo entre 1 e 1440 minutos.'
  if (!Number.isInteger(porcoes) || porcoes < 1 || porcoes > 100) return 'Informe de 1 a 100 porções.'
  return ''
}

export function textoSeguro(valor, maximo) {
  return String(valor ?? '').trim().slice(0, maximo)
}
