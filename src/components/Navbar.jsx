import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'
import './NavbarNova.css'

export default function Navbar() {
  const { usuario, sair } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [contagem, setContagem] = useState({ usuarioId: null, naoLidas: 0 })
  const usuarioId = usuario?.id ?? null
  const naoLidas = contagem.usuarioId === usuarioId ? contagem.naoLidas : 0
  useEffect(() => {
    if (!usuarioId) return
    let ativo = true
    const consultar = () => api('/messages/unread').then(r => { if (ativo) setContagem({ usuarioId, naoLidas: r.naoLidas || 0 }) }).catch(() => {})
    consultar()
    const temporizador = setInterval(consultar, 20000)
    return () => { ativo = false; clearInterval(temporizador) }
  }, [usuarioId])
  const navegar = useNavigate()
  async function logout() { await sair(); setAberto(false); navegar('/') }
  const links = [ ['/comunidade', 'Comunidade'], ['/receitas', 'Receitas'] ]
  return <header className="nf-topbar bg-white border-bottom sticky-top">
    <div className="container nf-topbar-layout">
      <Link className="nf-brand text-decoration-none" to="/comunidade" onClick={()=>setAberto(false)}><span aria-hidden="true" className="nf-brand-icon"><i className="bi bi-flower2" /></span><strong>NutriFlow</strong></Link>
      <button type="button" className="btn btn-outline-success nf-mobile-menu" aria-expanded={aberto} aria-label="Abrir navegação" onClick={()=>setAberto(v=>!v)}><i className={`bi ${aberto ? 'bi-x-lg' : 'bi-list'}`}/></button>
      <nav className={`nf-primary-nav ${aberto ? 'nf-nav-open' : ''}`} aria-label="Navegação principal">
        {links.map(([destino, nome]) => <NavLink key={destino} to={destino} end={destino==='/'} onClick={()=>setAberto(false)} className={({isActive}) => `nf-nav-link ${isActive ? 'nf-active' : ''}`}>{nome}</NavLink>)}
        {usuario ? <><NavLink to="/conexoes" onClick={()=>setAberto(false)} className="nf-nav-link">Conexões</NavLink><NavLink to="/mensagens" onClick={()=>setAberto(false)} className="nf-nav-link">Mensagens {naoLidas > 0 && <span className="nf-unread-pill" aria-label={`${naoLidas} mensagens não lidas`}>{naoLidas > 99 ? '99+' : naoLidas}</span>}</NavLink>{usuario.papel === 'admin' && <NavLink to="/admin/denuncias" onClick={()=>setAberto(false)} className="nf-nav-link">Moderação</NavLink>}<NavLink to="/salvos" onClick={()=>setAberto(false)} className="nf-nav-link">Meus salvos</NavLink><NavLink to="/perfil" onClick={()=>setAberto(false)} className="nf-nav-link">Meu perfil</NavLink><button className="btn btn-outline-success btn-sm" type="button" onClick={logout}>Sair</button></>
          : <><NavLink to="/login" onClick={()=>setAberto(false)} className="nf-nav-link">Entrar</NavLink><Link to="/cadastro" className="btn btn-success btn-sm" onClick={()=>setAberto(false)}>Criar conta</Link></>}
      </nav>
    </div>
  </header>
}
