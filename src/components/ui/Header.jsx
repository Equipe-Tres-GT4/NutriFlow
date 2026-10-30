import { Link } from 'react-router-dom';
import logo from '../assets/nutrilogo.png'
import './Header.css'

function Header() {
    return (
        <header className="cabecalho">
            <Link to="/" className="logo">
                <img
                    src={logo}
                    alt="Logo do NutriFlow"
                    className="logo-icon"
                />

            </Link>

            <nav className="menu">
                <Link to="/" className="linkMenu">
                    Início
                </Link>

                <Link to="/receitas" className="linkMenu">
                    Receitas
                </Link>

                <Link to="/entrar" className="linkMenu">
                    Entrar
                </Link>

                 <Link to="/cadastrar" className="linkMenu">
                    Cadastrar
                </Link>
            </nav>

        </header>
    );
}

export default Header;