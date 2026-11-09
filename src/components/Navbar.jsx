import React, { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useRecipes } from '../context/RecipeContext'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { savedRecipeIds, currentUser } = useRecipes()
  const { usuario, estaAutenticado, sair } = useAuth()
  const totalSalvos = savedRecipeIds ? savedRecipeIds.length : 0
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const navigate = useNavigate()

  const irParaLogin = () => {
    setMenuPerfilAberto(false)
    navigate('/login')
  }

  const handleLogout = () => {
    sair()
    setMenuPerfilAberto(false)
    navigate('/')
  }

  return (
    <header className="bg-white border-bottom sticky-top py-2">
      <div className="container d-flex align-items-center justify-content-between">
        {/* LOGÓTIPO */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, backgroundColor: '#e8f0e6', color: '#1b4332' }}
          >
            <i className="bi bi-flower2 fs-5"></i>
          </div>
          <span className="fw-bold fs-4" style={{ color: '#1b4332', letterSpacing: '-0.5px' }}>
            NutriFlow
          </span>
        </Link>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="d-none d-md-flex align-items-center gap-4">
          <NavLink to="/" end className={({ isActive }) => `text-decoration-none fw-semibold small ${isActive ? 'border-bottom border-2 pb-1' : 'text-secondary'}`} style={({ isActive }) => ({ color: isActive ? '#1b4332' : '', borderColor: isActive ? '#1b4332' : 'transparent' })}>
            Início
          </NavLink>
          <NavLink to="/alimentos" className={({ isActive }) => `text-decoration-none fw-semibold small ${isActive ? 'border-bottom border-2 pb-1' : 'text-secondary'}`} style={({ isActive }) => ({ color: isActive ? '#1b4332' : '', borderColor: isActive ? '#1b4332' : 'transparent' })}>
            Alimentos
          </NavLink>
          <NavLink to="/receitas" className={({ isActive }) => `text-decoration-none fw-semibold small ${isActive ? 'border-bottom border-2 pb-1' : 'text-secondary'}`} style={({ isActive }) => ({ color: isActive ? '#1b4332' : '', borderColor: isActive ? '#1b4332' : 'transparent' })}>
            Receitas
          </NavLink>
        </nav>

        {/* AÇÕES À DIREITA */}
        <div className="d-flex align-items-center gap-3 position-relative">
          <Link
            to="/salvos"
            className="btn btn-light btn-sm rounded-circle position-relative p-2 text-secondary shadow-sm"
            title="Receitas Salvas"
          >
            <i className="bi bi-bookmark-heart fs-6"></i>
            {totalSalvos > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem' }}
              >
                {totalSalvos}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 text-secondary shadow-sm"
            onClick={() => {
              const inputBusca = document.querySelector('input[type="text"]')
              if (inputBusca) {
                inputBusca.focus()
              } else {
                navigate('/alimentos')
              }
            }}
            title="Pesquisar Alimentos"
          >
            <i className="bi bi-search fs-6"></i>
          </button>

          {/* PERFIL / LOGIN / LOGOUT MENU */}
          <div className="position-relative">
            <button
              type="button"
              className={`btn btn-sm rounded-circle p-2 shadow-sm ${
                estaAutenticado ? 'btn-success text-white' : 'btn-light text-secondary'
              }`}
              style={estaAutenticado ? { backgroundColor: '#1b4332', borderColor: '#1b4332' } : {}}
              onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
              title="Conta do Usuário"
            >
              <i className="bi bi-person fs-5"></i>
            </button>

            {menuPerfilAberto && (
              <div
                className="card border-0 shadow-lg rounded-4 position-absolute end-0 mt-2 p-3"
                style={{ minWidth: '220px', zIndex: 1050 }}
              >
                {estaAutenticado ? (
                  <>
                    <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: 34, height: 34, backgroundColor: '#1b4332', fontSize: '0.85rem' }}
                      >
                        {usuario?.nome ? usuario.nome[0].toUpperCase() : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <span className="d-block small fw-bold text-dark text-truncate">
                          {usuario?.nome || currentUser?.name || 'Usuário NutriFlow'}
                        </span>
                        <span className="d-block text-success small" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-check-circle-fill me-1"></i>Conectado
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/salvos"
                      onClick={() => setMenuPerfilAberto(false)}
                      className="btn btn-light btn-sm text-start mb-2 d-flex align-items-center gap-2 text-secondary rounded-3"
                    >
                      <i className="bi bi-bookmark-heart text-danger"></i>
                      Receitas Salvas ({totalSalvos})
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-outline-danger btn-sm w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Sair (Logout)
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-3">
                      <i className="bi bi-person-circle fs-3 text-secondary"></i>
                      <p className="small text-muted mb-0 mt-1">Você está desconectado</p>
                    </div>

                    <button
                      type="button"
                      onClick={irParaLogin}
                      className="btn text-white btn-sm w-100 rounded-3 fw-semibold shadow-sm"
                      style={{ backgroundColor: '#1b4332' }}
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Entrar (Login)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}