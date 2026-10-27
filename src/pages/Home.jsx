import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useComunidade } from '../context/ComunidadeContext'
import { alimentos } from '../data/alimentos'
import { AvisoAlimentar, ListaFiltros, ReceitaCard, Vazio } from '../components/Painel'
import { filtrarReceitas, PREFERENCIAS, primeiraPalavra } from '../utils/nutriflow'

export default function Home() {
  const { usuario } = useAuth()
  const { receitas, favoritos, minhasReceitas } = useComunidade()
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState([])
  const navigate = useNavigate()
  const resultados = useMemo(() => filtrarReceitas(receitas, busca, filtros), [receitas, busca, filtros])
  const [mostrarTudo, setMostrarTudo] = useState(false)
  function alternar(id) { setFiltros((anteriores) => anteriores.includes(id) ? anteriores.filter((item) => item !== id) : [...anteriores, id]) }
  const preferencias = PREFERENCIAS.filter((f) => (usuario?.preferencias || []).includes(f.id))

  return <div className="np-dashboard">
    <div className="np-welcome-row"><div><span className="np-overline">BEM-VINDO AO SEU ESPAÇO <i className="bi bi-sun" aria-hidden="true"/></span><h1>Olá, {primeiraPalavra(usuario?.nome)} <span role="img" aria-label="aceno">👋</span></h1><p>Boas escolhas começam com informação. O que vamos descobrir hoje?</p></div><span className="np-today"><i className="bi bi-stars" aria-hidden="true"/> Seu cantinho de bem-estar</span></div>

    <section className="np-hero-dashboard" aria-labelledby="np-hero-titulo"><div className="np-hero-copy"><span className="np-hero-badge"><i className="bi bi-stars" aria-hidden="true"/> SUA ALIMENTAÇÃO, DO SEU JEITO</span><h2 id="np-hero-titulo">Comer bem pode ser <em>mais simples.</em></h2><p>Encontre alimentos, descubra novos sabores e guarde receitas que combinam com sua rotina.</p><form className="np-hero-form" onSubmit={(e) => { e.preventDefault(); navigate(`/receitas?busca=${encodeURIComponent(busca)}`) }}><label htmlFor="home-busca" className="visually-hidden">Buscar receitas ou ingredientes</label><i className="bi bi-search" aria-hidden="true"/><input id="home-busca" value={busca} maxLength={100} onChange={(e) => { setBusca(e.target.value); setMostrarTudo(false) }} placeholder="Busque por receitas, ingredientes..."/><button type="submit">Explorar <i className="bi bi-arrow-right" aria-hidden="true"/></button></form><span className="np-hero-tip"><i className="bi bi-shield-check" aria-hidden="true"/> Informação clara para escolhas conscientes</span></div><div className="np-hero-art"><div className="np-hero-orbit orbit-one"/><div className="np-hero-orbit orbit-two"/><div className="np-hero-dish"><img src="/panqueca.jpg" alt="Panquecas de banana em prato"/></div><span className="np-floating-badge np-badge-a"><i className="bi bi-heart-pulse-fill" aria-hidden="true"/> Escolhas melhores</span><span className="np-floating-badge np-badge-b"><i className="bi bi-check-circle-fill" aria-hidden="true"/> Do seu jeito</span></div></section>

    <section className="np-stats" aria-label="Resumo do seu espaço"><div className="np-stat"><span className="np-stat-icon stat-green"><i className="bi bi-journal-text"/></span><div><strong>{receitas.length}</strong><span>Receitas para explorar</span></div></div><div className="np-stat"><span className="np-stat-icon stat-peach"><i className="bi bi-bookmark-heart"/></span><div><strong>{favoritos.length}</strong><span>Receitas salvas</span></div></div><div className="np-stat"><span className="np-stat-icon stat-blue"><i className="bi bi-basket2"/></span><div><strong>{alimentos.length}</strong><span>Alimentos catalogados</span></div></div><div className="np-stat"><span className="np-stat-icon stat-purple"><i className="bi bi-pencil-square"/></span><div><strong>{minhasReceitas.length}</strong><span>Receitas que você criou</span></div></div></section>

    <section className="np-section" aria-labelledby="filtros-titulo"><div className="np-section-title"><div><span className="np-overline">ENCONTRE O QUE COMBINA COM VOCÊ</span><h2 id="filtros-titulo">Suas escolhas, seu ritmo <span>🌿</span></h2><p>Selecione filtros para explorar as receitas com mais facilidade.</p></div><Link to="/perfil">Editar preferências <i className="bi bi-arrow-up-right"/></Link></div><ListaFiltros ativos={filtros} alternar={alternar} filtros={PREFERENCIAS}/>{preferencias.length > 0 && <p className="np-preferences-suggestion"><i className="bi bi-lightbulb" aria-hidden="true"/> No seu perfil: {preferencias.map((p) => p.rotulo.toLowerCase()).join(', ')}. Escolha os filtros acima para aplicá-los.</p>}</section>

    <section className="np-section" aria-labelledby="receitas-titulo"><div className="np-section-title"><div><span className="np-overline">INSPIRAÇÃO PARA HOJE</span><h2 id="receitas-titulo">Receitas para você</h2><p>{resultados.length} {resultados.length === 1 ? 'receita encontrada' : 'receitas encontradas'} no catálogo.</p></div><Link to="/receitas">Ver todas as receitas <i className="bi bi-arrow-up-right"/></Link></div>{resultados.length > 0 ? <div className="np-card-grid">{(mostrarTudo ? resultados : resultados.slice(0, 3)).map((receita) => <ReceitaCard receita={receita} key={receita.id}/>)}</div> : <Vazio titulo="Não encontramos receitas" descricao="Experimente remover um filtro ou buscar outro ingrediente."/>}{resultados.length > 3 && <div className="np-more-wrapper"><button type="button" className="np-outline-action" onClick={() => setMostrarTudo(!mostrarTudo)}>{mostrarTudo ? 'Mostrar menos' : 'Mostrar mais receitas'} <i className={`bi ${mostrarTudo ? 'bi-chevron-up' : 'bi-chevron-down'}`}/></button></div>}</section>

    <section className="np-bottom-panels"><div className="np-discover-panel"><div className="np-panel-emoji" aria-hidden="true">🥬</div><div><span className="np-overline">CONHEÇA O QUE VOCÊ CONSOME</span><h2>Entenda melhor os alimentos do seu dia a dia.</h2><p>Consulte ingredientes, possíveis alergênicos e fontes de informação.</p><Link to="/alimentos">Explorar alimentos <i className="bi bi-arrow-right"/></Link></div></div><div className="np-share-panel"><span className="np-overline">COMUNIDADE NUTRIFLOW</span><div className="np-share-illustration" aria-hidden="true"><span>🍓</span><span>🥑</span><span>🥕</span></div><h2>Uma boa receita merece ser compartilhada.</h2><p>Tem algo gostoso para ensinar? Publique no seu espaço.</p><Link to="/publicar">Compartilhar receita <i className="bi bi-arrow-right"/></Link></div></section>
    <AvisoAlimentar/>
  </div>
}
