
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Footer from './Footer'

export default function Layout() {
  const { usuario, sair } = useAuth()

  return (
    <>
      <nav className="navbar navbar-expand-md nf-navbar sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">
            <i className="bi bi-flower2 me-2"></i>
            NutriFlow
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menu"
            aria-controls="menu"
            aria-expanded="false"
            aria-label="Alternar navegação"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="menu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>
                  Início
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/pesquisa">
                  Pesquisa
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/receitas">
                  Receitas
                </NavLink>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              <span className="small d-none d-md-inline">
                Olá, {usuario?.nome}
              </span>

              <button
                className="btn btn-outline-primary btn-sm"
                type="button"
                onClick={sair}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
