import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { usuario, estaAutenticado, sair } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    sair()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm px-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="bi bi-flower2 me-2 fs-4"></i> NutriFlow
        </Link>

        <div className="d-flex align-items-center gap-2">
          {estaAutenticado ? (
            <div className="d-flex align-items-center gap-3">
              <span className="text-white small d-none d-md-inline">
                Olá, <strong>{usuario.nome}</strong>
              </span>

              <Link to="/minhas-receitas" className="btn btn-outline-light btn-sm rounded-pill">
                <i className="bi bi-bookmark-heart me-1"></i> Salvas ({usuario.receitasSalvas?.length || 0})
              </Link>

              <Link to="/nova-receita" className="btn btn-light btn-sm rounded-pill text-success fw-semibold">
                <i className="bi bi-plus-circle me-1"></i> Criar Receita
              </Link>

              <button onClick={handleLogout} className="btn btn-outline-light btn-sm rounded-pill">
                Sair
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-light btn-sm rounded-pill px-3 fw-semibold text-success">
                <i className="bi bi-person me-1"></i> Entrar
              </Link>
              <Link to="/cadastro" className="btn btn-outline-light btn-sm rounded-pill px-3">
                Cadastre-se
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}