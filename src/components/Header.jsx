
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import logo from '../assets/nutrilogo.png';
import './Header.css';

function Header({ isAuthenticated = false }) {
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
  }

  const linkClass = ({ isActive }) =>
    `nav-link linkMenu ${isActive ? 'ativo' : ''}`;

  return (
    <header className="cabecalho">
      <nav className="navbar navbar-expand-lg navbar-light container-fluid">
        <Link
          to="/"
          className="logo d-flex align-items-center"
          onClick={fecharMenu}
        >
          <img
            src={logo}
            alt="Logo do NutriFlow"
            className="logo-icon"
          />

        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="menuNutriFlow"
          aria-expanded={menuAberto}
          aria-label="Abrir ou fechar menu"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          id="menuNutriFlow"
          className={`collapse navbar-collapse ${
            menuAberto ? 'show' : ''
          }`}
        >
          <div className="navbar-nav ms-auto menu">
            <NavLink
              to="/"
              end
              className={linkClass}
              onClick={fecharMenu}
            >
              Início
            </NavLink>

            <NavLink
              to="/alimentos"
              className={linkClass}
              onClick={fecharMenu}
            >
              Alimentos
            </NavLink>

            <NavLink
              to="/receitas"
              className={linkClass}
              onClick={fecharMenu}
            >
              Receitas
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/perfil"
                  className={linkClass}
                  onClick={fecharMenu}
                >
                  Perfil
                </NavLink>

                <NavLink
                  to="/salvos"
                  className={linkClass}
                  onClick={fecharMenu}
                >
                  Salvos
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={fecharMenu}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/cadastro"
                  className={linkClass}
                  onClick={fecharMenu}
                >
                  Cadastrar
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
