import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

import './Header.css';

function Header({ isAuthenticated = false }) {
  const { sair } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
    setPerfilAberto(false);
  }

  function encerrarSessao() {
    sair();
    fecharMenu();
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `nav-link linkMenu ${isActive ? 'ativo' : ''}`;

  return (
    <header className="cabecalho">
      <nav className="navbar navbar-expand-lg container-fluid">
        <div className="header-conteudo">
          <Link to="/" className="logo" onClick={fecharMenu}>
            <i className="bi bi-flower2 logo-icon" aria-hidden="true"></i>
            <span className="logo-text">NutriFlow</span>
          </Link>

          <button
            className="botao-menu-mobile"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <i className="bi bi-list"></i>
          </button>

          <div className={`area-navegacao ${menuAberto ? 'menu-aberto' : ''}`}>
            <div className="menu">
              <NavLink to="/" end className={linkClass} onClick={fecharMenu}>
                Início
              </NavLink>
              <NavLink to="/alimentos" className={linkClass} onClick={fecharMenu}>
                Alimentos
              </NavLink>
              <NavLink to="/receitas" className={linkClass} onClick={fecharMenu}>
                Receitas
              </NavLink>
            </div>

            <div className="acoes-header">
              <Link
                to="/alimentos"
                className="icone-header"
                aria-label="Pesquisar alimentos"
                onClick={fecharMenu}
              >
                <i className="bi bi-search"></i>
              </Link>

              <div className="perfil-container">
                <button
                  type="button"
                  className="icone-header"
                  aria-label="Menu do perfil"
                  aria-expanded={perfilAberto}
                  onClick={() => setPerfilAberto(!perfilAberto)}
                >
                  <i className="bi bi-person"></i>
                </button>

                {perfilAberto && (
                  <div className="menu-perfil">
                    {isAuthenticated ? (
                      <>
                        <Link to="/perfil" onClick={fecharMenu}>
                          <i className="bi bi-person me-2"></i>
                          Perfil
                        </Link>
                        <Link to="/salvos" onClick={fecharMenu}>
                          <i className="bi bi-bookmark me-2"></i>
                          Salvos
                        </Link>
                        <button
                          type="button"
                          className="acao-sair-perfil"
                          onClick={encerrarSessao}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Sair
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={fecharMenu}>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Entrar
                        </Link>
                        <Link to="/cadastro" onClick={fecharMenu}>
                          <i className="bi bi-person-plus me-2"></i>
                          Cadastrar
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;