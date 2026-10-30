import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function Layout() {
  const { usuario, sair } = useAuth()

  return (
    <>
      <nav className="navbar navbar-expand-md nf-navbar sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">
            <i className="bi bi-flower2 me-2"></i>NutriFlow
          </Link>
          <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><NavLink className="nav-link" to="/" end>Início</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/pesquisa">Pesquisa</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/receitas">Receitas</NavLink></li>
            </ul>
            <div className="d-flex align-items-center gap-3">
              <span className="small d-none d-md-inline">Olá, {usuario?.nome}</span>
              <button className="btn btn-outline-primary btn-sm" onClick={sair}>
                <i className="bi bi-box-arrow-right me-1"></i>Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>

      <footer className="nf-footer mt-5 py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-5">
              <h5 className="fw-bold"><i className="bi bi-flower2 me-2"></i>NutriFlow</h5>
              <p className="small opacity-75">Alimentação consciente, vida melhor.</p>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="fw-bold">Links</h6>
              <ul className="list-unstyled small">
                <li><Link to="/">Início</Link></li>
                <li><Link to="/pesquisa">Pesquisa</Link></li>
                <li><Link to="/receitas">Receitas</Link></li>
              </ul>
            </div>
            <div className="col-6 col-md-4">
              <h6 className="fw-bold">Suporte</h6>
              <ul className="list-unstyled small">
                <li><a href="#">Sobre nós</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}