import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useComunidade } from '../context/ComunidadeContext'
import { AvisoAlimentar, CabecalhoPagina, ListaFiltros, ReceitaCard, Vazio } from '../components/Painel'
import { filtrarReceitas, PREFERENCIAS } from '../utils/nutriflow'

export default function ListaReceitas({ apenasSalvos = false, apenasMinhas = false }) {
  const { receitas, favoritos, minhasReceitas, excluirReceita } = useComunidade()
  const [params] = useSearchParams()
  const [busca, setBusca] = useState(params.get('busca')?.slice(0, 100) || '')
  const [categoria, setCategoria] = useState('Todas')
  const [filtros, setFiltros] = useState([])
  const [excluindo, setExcluindo] = useState(null)
  const titulo = apenasSalvos ? 'Receitas salvas' : apenasMinhas ? 'Minhas receitas' : 'Receitas da comunidade'
  const descricao = apenasSalvos ? 'Seus achados favoritos, organizados em um só lugar.' : apenasMinhas ? 'Gerencie as receitas que você compartilhou neste navegador.' : 'Explore sabores e novas ideias para a sua rotina.'
  const origem = apenasSalvos ? receitas.filter((r) => favoritos.includes(r.id)) : apenasMinhas ? minhasReceitas : receitas
  const categorias = ['Todas', ...new Set(origem.map((r) => r.categoria).filter(Boolean))]
  const resultados = filtrarReceitas(origem, busca, filtros, categoria)

  function alternar(id) { setFiltros((anterior) => anterior.includes(id) ? anterior.filter((x) => x !== id) : [...anterior, id]) }

  return <div className="np-page">
    <CabecalhoPagina etiqueta={apenasSalvos ? 'MINHA COLEÇÃO' : apenasMinhas ? 'MINHAS PUBLICAÇÕES' : 'A COMUNIDADE NA SUA MESA'} titulo={titulo} descricao={descricao} direita={<Link className="np-primary-link" to="/publicar"><i className="bi bi-plus-lg"/> Publicar receita</Link>}/>
    <div className="np-toolbar"><div className="np-search-field"><i className="bi bi-search" aria-hidden="true"/><label htmlFor="receita-busca" className="visually-hidden">Pesquisar receitas</label><input id="receita-busca" type="search" value={busca} maxLength={100} placeholder="Buscar receita ou ingrediente..." onChange={(e) => setBusca(e.target.value)}/></div><div className="np-category-select"><label className="visually-hidden" htmlFor="categoria-select">Categoria</label><select id="categoria-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>{categorias.map((nome) => <option key={nome}>{nome}</option>)}</select><i className="bi bi-chevron-down" aria-hidden="true"/></div></div>
    <ListaFiltros filtros={PREFERENCIAS} ativos={filtros} alternar={alternar}/>
    <div className="np-results-head"><span>{resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}</span>{(busca || filtros.length > 0 || categoria !== 'Todas') && <button type="button" onClick={() => { setBusca(''); setFiltros([]); setCategoria('Todas') }}>Limpar filtros <i className="bi bi-x" aria-hidden="true"/></button>}</div>
    {resultados.length ? <div className="np-card-grid">{resultados.map((r) => <div key={r.id} className="np-card-with-actions"><ReceitaCard receita={r}/>{apenasMinhas && <button type="button" className="np-delete-recipe" onClick={() => setExcluindo(r.id)}><i className="bi bi-trash3"/> Excluir publicação</button>}</div>)}</div> : <Vazio icone={apenasSalvos ? 'bi-bookmark-heart' : 'bi-journal-x'} titulo={apenasSalvos && !busca && !filtros.length ? 'Sua lista está vazia' : 'Nenhuma receita por aqui'} descricao={apenasSalvos ? 'Explore as receitas e toque no ícone de marcador para salvá-las.' : apenasMinhas ? 'Compartilhe sua primeira receita ou ajuste os filtros.' : 'Tente outra busca ou remova os filtros.'} acao={apenasSalvos ? 'Explorar receitas' : apenasMinhas ? 'Criar receita' : undefined} url={apenasSalvos ? '/receitas' : apenasMinhas ? '/publicar' : undefined}/>} 
    <AvisoAlimentar/>
    {excluindo && <div className="np-modal-backdrop" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="excluir-titulo" className="np-confirm-dialog"><span className="np-danger-circle"><i className="bi bi-exclamation-triangle"/></span><h2 id="excluir-titulo">Excluir esta receita?</h2><p>Esta publicação será removida da sua coleção local e não poderá ser recuperada.</p><div className="np-modal-actions"><button type="button" className="np-outline-action" onClick={() => setExcluindo(null)}>Cancelar</button><button type="button" className="btn btn-danger" onClick={() => { excluirReceita(excluindo); setExcluindo(null) }}>Sim, excluir</button></div></div></div>}
  </div>
}
