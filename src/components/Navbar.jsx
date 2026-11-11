
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'
import './NavbarNova.css'

export default function Navbar() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()

  const [aberto, setAberto] = useState(false)
  const [contagem, setContagem] = useState({
    usuarioId: null,
    naoLidas: 0,
  })

  const usuarioId = usuario?.id ?? null

  const naoLidas =
    contagem.usuarioId === usuarioId
      ? contagem.naoLidas
      : 0

  useEffect(() => {
    if (!usuarioId) return

    let ativo = true

    const consultar = () => {
      api('/messages/unread')
        .then((resposta) => {
          if (ativo) {
            setContagem({
              usuarioId,
              naoLidas: resposta.naoLidas || 0,
            })
          }
        })
        .catch(() => {})
    }

    consultar()

    const temporizador = setInterval(consultar, 20000)

    return () => {
      ativo = false
      clearInterval(temporizador)
    }
  }, [usuarioId])

  async function logout() {
    await sair()
    setAberto(false)
    navegar('/')
  }

  const fecharMenu = () => setAberto(false)

  const links = [
    ['/comunidade', 'Comunidade'],
    ['/receitas', 'Receitas'],
  ]

  const classeLink = ({ isActive }) =>
    `nf-nav-link ${isActive ? 'nf-active' : ''}`

  return (
    <header className="nf-topbar bg-white border-bottom sticky-top">
      <div className="container nf-topbar-layout">

        <Link
          className="nf-brand text-decoration-none"
          to="/comunidade"
          onClick={fecharMenu}
        >
          <span
            aria-hidden="true"
            className="nf-brand-icon"
          >
            <i className="bi bi-flower2" />
          </span>

          <strong>NutriFlow</strong>
        </Link>

        <button
          type="button"
          className="btn btn-outline-success nf-mobile-menu"
          aria-expanded={aberto}
          aria-label="Abrir navegação"
          onClick={() => setAberto((valor) => !valor)}
        >
          <i
            className={`bi ${aberto ? 'bi-x-lg' : 'bi-list'}`}
          />
        </button>

        <nav
          className={`nf-primary-nav ${
            aberto ? 'nf-nav-open' : ''
          }`}
          aria-label="Navegação principal"
        >
          {links.map(([destino, nome]) => (
            <NavLink
              key={destino}
              to={destino}
              end={destino === '/'}
              onClick={fecharMenu}
              className={classeLink}
            >
              {nome}
            </NavLink>
          ))}

          {usuario ? (
            <>
              <NavLink
                to="/conexoes"
                onClick={fecharMenu}
                className={classeLink}
              >
                Conexões
              </NavLink>

              <NavLink
                to="/mensagens"
                onClick={fecharMenu}
                className={classeLink}
              >
                Mensagens{' '}
                {naoLidas > 0 && (
                  <span
                    className="nf-unread-pill"
                    aria-label={`${naoLidas} mensagens não lidas`}
                  >
                    {naoLidas > 99 ? '99+' : naoLidas}
                  </span>
                )}
              </NavLink>

              {usuario.papel === 'admin' && (
                <NavLink
                  to="/admin/denuncias"
                  onClick={fecharMenu}
                  className={classeLink}
                >
                  Moderação
                </NavLink>
              )}

              <NavLink
                to="/salvos"
                onClick={fecharMenu}
                className={classeLink}
              >
                Meus salvos
              </NavLink>

              <NavLink
                to="/perfil"
                onClick={fecharMenu}
                className={classeLink}
              >
                Meu perfil
              </NavLink>

              <button
                className="btn btn-outline-success btn-sm"
                type="button"
                onClick={logout}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={fecharMenu}
                className={classeLink}
              >
                Entrar
              </NavLink>

              <Link
                to="/cadastro"
                className="btn btn-success btn-sm"
                onClick={fecharMenu}
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
