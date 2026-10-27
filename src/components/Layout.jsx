import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { iniciais } from '../utils/nutriflow'
import './Painel.css'

const NAVEGACAO = [
  { label: 'Visão geral', to: '/', icon: 'bi-grid-1x2' },
  { label: 'Explorar alimentos', to: '/alimentos', icon: 'bi-search-heart' },
  { label: 'Receitas', to: '/receitas', icon: 'bi-journal-richtext' },
  { label: 'Meus favoritos', to: '/salvos', icon: 'bi-bookmark-heart' },
  { label: 'Minhas receitas', to: '/minhas-receitas', icon: 'bi-folder2-open' },
]

function LinksDoMenu({ onClick }) {
  return NAVEGACAO.map((item) => (
    <NavLink key={item.to} end={item.to === '/'} to={item.to} onClick={onClick} className={({ isActive }) => `np-side-link ${isActive ? 'np-side-link-active' : ''}`}>
      <i className={`bi ${item.icon}`} aria-hidden="true"/><span>{item.label}</span>
    </NavLink>
  ))
}

export default function Layout() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  function encerrar() { sair(); navigate('/login', { replace: true }) }

  return (
    <div className="np-shell">
      <aside className={`np-sidebar ${menuAberto ? 'np-sidebar-open' : ''}`} aria-label="Navegação principal">
        <div className="np-side-top">
          <Link className="np-logo" to="/" onClick={() => setMenuAberto(false)} aria-label="NutriFlow: página inicial">
            <span className="np-logo-symbol"><i className="bi bi-flower2" aria-hidden="true" /></span>
            <span>Nutri<span>Flow</span><small>SEU ESPAÇO</small></span>
          </Link>
          <button className="np-mobile-close" type="button" onClick={() => setMenuAberto(false)} aria-label="Fechar menu"><i className="bi bi-x-lg" /></button>
        </div>
        <div className="np-side-section-caption">MENU PRINCIPAL</div>
        <nav className="np-side-nav"><LinksDoMenu onClick={() => setMenuAberto(false)} /></nav>
        <div className="np-side-section-caption np-side-second">MINHA CONTA</div>
        <nav className="np-side-nav">
          <NavLink to="/perfil" onClick={() => setMenuAberto(false)} className={({ isActive }) => `np-side-link ${isActive ? 'np-side-link-active' : ''}`}><i className="bi bi-person-gear" aria-hidden="true"/><span>Meu perfil</span></NavLink>
          <button className="np-side-link np-signout" type="button" onClick={encerrar}><i className="bi bi-box-arrow-left" aria-hidden="true"/><span>Sair da conta</span></button>
        </nav>
        <div className="np-side-bottom">
          <div className="np-help-card"><span className="np-help-icon"><i className="bi bi-stars" aria-hidden="true"/></span><strong>Tem uma receita especial?</strong><p>Compartilhe suas ideias com a comunidade.</p><Link to="/publicar" onClick={() => setMenuAberto(false)}>Criar receita <i className="bi bi-arrow-up-right" aria-hidden="true"/></Link></div>
          <div className="np-sidebar-copy">© 2026 NutriFlow · Protótipo</div>
        </div>
      </aside>
      {menuAberto && <button type="button" className="np-menu-overlay" aria-label="Fechar menu" onClick={() => setMenuAberto(false)} />}
      <div className="np-area">
        <header className="np-topbar">
          <div className="np-top-left">
            <button className="np-menu-button" onClick={() => setMenuAberto(true)} type="button" aria-label="Abrir menu"><i className="bi bi-list" /></button>
            <div className="np-breadcrumb"><i className="bi bi-house-door" aria-hidden="true"/> <span>/</span> <span>Meu espaço</span></div>
          </div>
          <div className="np-top-actions">
            <Link to="/alimentos" className="np-top-search"><i className="bi bi-search" aria-hidden="true" /><span>Pesquisar alimentos...</span><kbd>↵</kbd></Link>
            <Link to="/publicar" className="np-create-top"><i className="bi bi-plus-lg" aria-hidden="true" /><span>Nova receita</span></Link>
            <Link to="/perfil" className="np-avatar-link" title="Ver meu perfil" aria-label={`Perfil de ${usuario?.nome || 'usuário'}`}><span className="np-avatar">{iniciais(usuario?.nome)}</span><span className="np-avatar-name"><strong>{usuario?.nome?.split(' ')[0] || 'Olá'}</strong><small>Minha conta</small></span><i className="bi bi-chevron-down" aria-hidden="true" /></Link>
          </div>
        </header>
        <main id="conteudo-principal" className="np-main container-fluid"><Outlet /></main>
        <footer className="np-footer">NutriFlow · Confira rótulos e informações de fabricantes; as sugestões não substituem orientação profissional. <span>Feito para escolhas mais conscientes <i className="bi bi-heart-fill" aria-hidden="true"/></span></footer>
      </div>
    </div>
  )
}
