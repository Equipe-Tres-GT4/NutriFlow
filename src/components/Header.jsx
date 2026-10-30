import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Header({ isAuthenticated }) {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef(null)

  // Fecha o menu ao clicar fora dele
  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  // Fecha o menu ao trocar de página
  useEffect(() => {
    setMenuAberto(false)
  }, [location])

  function handleLogout() {
    sair()
    setMenuAberto(false)
    navigate('/')
  }

  return (
    <header className="bg-white border-bottom sticky-top py-2 px-3">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center text-decoration-none">
          <span className="fw-bold text-success fs-4 d-flex align-items-center">
            <i className="bi bi-flower2 me-2"></i> NutriFlow
          </span>
        </Link>

        {/* Links Centrais */}
        <nav className="d-none d-md-flex gap-4">
          <Link
            to="/"
            className={`text-decoration-none fw-semibold ${location.pathname === '/' ? 'text-success' : 'text-secondary'}`}
          >
            Início
          </Link>
          <Link
            to="/alimentos"
            className={`text-decoration-none fw-semibold ${location.pathname === '/alimentos' ? 'text-success' : 'text-secondary'}`}
          >
            Alimentos
          </Link>
          <Link
            to="/receitas"
            className={`text-decoration-none fw-semibold ${location.pathname === '/receitas' ? 'text-success' : 'text-secondary'}`}
          >
            Receitas
          </Link>
        </nav>

        {/* Ações da Direita */}
        <div className="d-flex align-items-center gap-3 position-relative" ref={menuRef}>
          <Link to="/alimentos" className="text-secondary fs-5" title="Pesquisar">
            <i className="bi bi-search"></i>
          </Link>

          {isAuthenticated ? (
            <div>
              {/* Botão de Usuário que abre o menu da foto */}
              <button
                type="button"
                className="btn btn-light rounded-circle p-1 border d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
                onClick={() => setMenuAberto(!menuAberto)}
                aria-expanded={menuAberto}
                title="Minha Conta"
              >
                <i className="bi bi-person fs-5 text-secondary"></i>
              </button>

              {/* Menu Suspenso (Dropdown) */}
              {menuAberto && (
                <div
                  className="card position-absolute end-0 mt-2 shadow border-0 rounded-4 overflow-hidden"
                  style={{ width: 200, zIndex: 1050 }}
                >
                  <div className="py-2 px-3 border-bottom bg-light">
                    <span className="d-block fw-bold text-truncate text-dark small">
                      {usuario?.nome || 'Usuário'}
                    </span>
                    <span className="d-block text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                      {usuario?.email}
                    </span>
                  </div>

                  <div className="p-1">
                    <Link
                      to="/perfil"
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-secondary text-decoration-none"
                    >
                      <i className="bi bi-person text-success"></i> Perfil
                    </Link>

                    <Link
                      to="/salvos"
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-secondary text-decoration-none"
                    >
                      <i className="bi bi-bookmark text-success"></i> Salvos
                      {usuario?.receitasSalvas?.length > 0 && (
                        <span className="badge bg-success-subtle text-success ms-auto rounded-pill">
                          {usuario.receitasSalvas.length}
                        </span>
                      )}
                    </Link>

                    <hr className="my-1 text-muted opacity-25" />

                    {/* Botão de Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-danger border-0 bg-transparent w-100 text-start"
                    >
                      <i className="bi bi-box-arrow-right"></i> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}