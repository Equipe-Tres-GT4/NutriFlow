import { useMemo, useState } from 'react'
import { alimentos } from '../data/alimentos'
import { AvisoAlimentar, CabecalhoPagina, ListaFiltros, Vazio } from '../components/Painel'
import { PREFERENCIAS } from '../utils/nutriflow'

const ALERGENICOS = { gluten: ['trigo', 'glúten', 'gluten', 'cevada', 'centeio', 'aveia'], lactose: ['leite', 'lactose', 'derivados do leite'] }
function normalizar(texto) { return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() }
function possivelAlergeno(alimento, filtro) {
  const fontes = [...(alimento.alergenicos?.contem || []), ...(alimento.alergenicos?.podeConter || [])].map(normalizar)
  return (ALERGENICOS[filtro] || []).some((termo) => fontes.some((origem) => origem.includes(normalizar(termo))))
}
function permitido(alimento, filtros) {
  return filtros.every((f) => {
    const r = alimento.restricoes || {}
    if (f === 'gluten') return r.gluten === 'nao_contem' && !possivelAlergeno(alimento, 'gluten')
    if (f === 'lactose') return r.lactose === 'nao_contem' && !possivelAlergeno(alimento, 'lactose')
    if (f === 'vegetariano') return r.vegetariano === 'sim'
    if (f === 'vegano') return r.vegano === 'sim'
    return true
  })
}
function status(valor) {
  if (valor === 'contem' || valor === 'nao') return { texto: 'Contém / não se aplica', cor: 'warn' }
  if (valor === 'nao_contem' || valor === 'sim') return { texto: 'Informado como compatível*', cor: 'ok' }
  return { texto: 'Não confirmado', cor: 'neutral' }
}

export default function Alimentos() {
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState([])
  const [abertos, setAbertos] = useState([])
  const resultados = useMemo(() => alimentos.filter((item) => {
    const texto = [item.nome, item.marca, ...(item.ingredientes || [])].join(' ').toLocaleLowerCase('pt-BR')
    return texto.includes(busca.trim().toLocaleLowerCase('pt-BR')) && permitido(item, filtros)
  }), [busca, filtros])
  function alternarFiltro(id) { setFiltros((atual) => atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]) }
  function alternarDetalhe(id) { setAbertos((atual) => atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]) }

  return <div className="np-page"><CabecalhoPagina etiqueta="CONHEÇA MELHOR SEUS ALIMENTOS" titulo="Explorar alimentos" descricao="Pesquise ingredientes, alergênicos e fontes informadas no catálogo NutriFlow."/>
    <div className="np-toolbar"><div className="np-search-field"><i className="bi bi-search" aria-hidden="true"/><label className="visually-hidden" htmlFor="alimento-pesquisa">Buscar alimentos</label><input id="alimento-pesquisa" type="search" maxLength={100} placeholder="Nome, marca ou ingrediente..." value={busca} onChange={(e) => setBusca(e.target.value)}/></div></div><ListaFiltros filtros={PREFERENCIAS} ativos={filtros} alternar={alternarFiltro}/>
    <div className="np-results-head"><span>{resultados.length} alimentos encontrados</span>{(busca || filtros.length > 0) && <button type="button" onClick={() => { setBusca(''); setFiltros([]) }}>Limpar filtros <i className="bi bi-x"/></button>}</div>
    {resultados.length ? <div className="np-food-grid">{resultados.map((item) => <article key={item.id} className="np-food-card"><div className="np-food-photo"><img src={item.imagem} alt={item.nome} loading="lazy"/></div><div className="np-food-card-body"><span className="np-overline">{item.marca || 'ALIMENTO NATURAL'}</span><h2>{item.nome}</h2><p><strong>Ingredientes:</strong> {item.ingredientes?.join(', ') || 'Não informados'}</p><div className="np-food-tags"><span className={status(item.restricoes?.gluten).cor}><i className="bi bi-circle-fill"/> Glúten: {item.restricoes?.gluten === 'contem' ? 'Contém' : item.restricoes?.gluten === 'nao_contem' ? 'Ausência informada*' : 'Não confirmado'}</span><span className={status(item.restricoes?.lactose).cor}><i className="bi bi-circle-fill"/> Lactose: {item.restricoes?.lactose === 'contem' ? 'Contém' : item.restricoes?.lactose === 'nao_contem' ? 'Ausência informada*' : 'Não confirmado'}</span></div><button type="button" className="np-food-details-toggle" onClick={() => alternarDetalhe(item.id)} aria-expanded={abertos.includes(item.id)}>Ingredientes e fontes <i className={`bi ${abertos.includes(item.id) ? 'bi-chevron-up' : 'bi-chevron-down'}`}/></button>{abertos.includes(item.id) && <div className="np-food-expanded"><p><strong>Presença declarada:</strong> {item.alergenicos?.contem?.join(', ') || 'Nenhum dado'}</p><p><strong>Pode conter:</strong> {item.alergenicos?.podeConter?.join(', ') || 'Não informado'}</p><p><strong>Vegetariano:</strong> {item.restricoes?.vegetariano === 'sim' ? 'Informado como sim' : item.restricoes?.vegetariano === 'nao' ? 'Não' : 'Não confirmado'}</p><p><strong>Vegano:</strong> {item.restricoes?.vegano === 'sim' ? 'Informado como sim' : item.restricoes?.vegano === 'nao' ? 'Não' : 'Não confirmado'}</p><p><strong>Consulta:</strong> {item.dataConsulta || 'Não informada'}</p>{/^https?:\/\//.test(item.fonte?.url || '') && <a href={item.fonte.url} target="_blank" rel="noopener noreferrer">Ver fonte informada <i className="bi bi-box-arrow-up-right"/></a>}</div>}</div></article>)}</div> : <Vazio titulo="Nenhum alimento encontrado" descricao="Tente outra pesquisa. Itens sem confirmação de compatibilidade não aparecem quando os filtros são aplicados."/>}<AvisoAlimentar/>
  </div>
}
