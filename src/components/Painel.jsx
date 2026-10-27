import { Link } from 'react-router-dom'
import { useComunidade } from '../context/ComunidadeContext'
import { resumoRestricoes } from '../utils/nutriflow'

export function CabecalhoPagina({ etiqueta, titulo, descricao, direita }) {
  return <div className="np-page-head"><div>{etiqueta && <span className="np-overline">{etiqueta}</span>}<h1>{titulo}</h1>{descricao && <p>{descricao}</p>}</div>{direita && <div className="np-head-actions">{direita}</div>}</div>
}

export function ListaFiltros({ ativos, alternar, filtros }) {
  return <div className="np-filters" role="group" aria-label="Filtrar por preferência alimentar">{filtros.map((f) => <button type="button" key={f.id} className={`np-filter ${ativos.includes(f.id) ? 'np-filter-on' : ''}`} aria-pressed={ativos.includes(f.id)} onClick={() => alternar(f.id)}><i className={`bi ${f.icone}`} aria-hidden="true"/>{f.rotulo}{ativos.includes(f.id) && <i className="bi bi-check-lg" aria-hidden="true"/>}</button>)}</div>
}

export function ReceitaCard({ receita }) {
  const { favoritos, alternarFavorito } = useComunidade()
  const salvo = favoritos.includes(receita.id)
  return <article className="np-recipe-card">
    <div className="np-recipe-photo"><Link to={`/receitas/${encodeURIComponent(receita.id)}`} tabIndex={-1} aria-hidden="true"><img src={receita.imagem} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/receita.jpg' }}/></Link><span className="np-recipe-category">{receita.categoria}</span><button type="button" className={`np-fav-button ${salvo ? 'np-fav-on' : ''}`} onClick={() => alternarFavorito(receita.id)} aria-label={salvo ? `Remover ${receita.nome} dos favoritos` : `Salvar ${receita.nome} nos favoritos`} title={salvo ? 'Remover dos salvos' : 'Salvar receita'} aria-pressed={salvo}><i className={`bi ${salvo ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}`} aria-hidden="true"/></button></div>
    <div className="np-recipe-body"><span className="np-recipe-by">Por {receita.autor || 'Comunidade NutriFlow'}</span><Link to={`/receitas/${encodeURIComponent(receita.id)}`} className="np-recipe-title">{receita.nome}</Link><p className="np-recipe-description">{receita.descricao}</p><div className="np-recipe-tags">{resumoRestricoes(receita).slice(0, 2).map((etiqueta) => <span key={etiqueta}>{etiqueta}</span>)}{resumoRestricoes(receita).length === 0 && <span>Confira os ingredientes</span>}</div><div className="np-recipe-bottom"><span><i className="bi bi-clock" aria-hidden="true"/> {receita.tempoPreparo || 'Tempo não informado'}</span><Link to={`/receitas/${encodeURIComponent(receita.id)}`} aria-label={`Ver receita ${receita.nome}`}>Ver receita <i className="bi bi-arrow-right" aria-hidden="true"/></Link></div></div>
  </article>
}

export function AvisoAlimentar() {
  return <p className="np-food-disclaimer"><i className="bi bi-info-circle" aria-hidden="true"/> Informações e selos com * são indicativos, conforme os dados publicados ou informados pelo autor. Para alergias e restrições, confira ingredientes, rótulos, possíveis contaminações cruzadas e fontes oficiais.</p>
}

export function Vazio({ icone = 'bi-search', titulo, descricao, acao, url }) {
  return <div className="np-empty"><span><i className={`bi ${icone}`} aria-hidden="true"/></span><h3>{titulo}</h3><p>{descricao}</p>{acao && url && <Link className="btn btn-primary" to={url}>{acao}</Link>}</div>
}
