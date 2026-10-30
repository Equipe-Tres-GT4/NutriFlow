import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Logo e descrição */}
        <div className="footer-brand">
          <i className="bi bi-sprout footer-leaf"></i>
          <div>
            <h3>NutriFlow</h3>
            <p className="footer-description">
              Alimentação consciente, vida melhor.
            </p>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Links */}
        <div className="footer-columns">
          <div>
            <h5>Links rápidos</h5>
            <ul className="footer-links">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/alimentos">Pesquisar alimentos</Link></li>
              <li><Link to="/receitas">Receitas</Link></li>
            </ul>
          </div>

          <div>
            <h5>Suporte</h5>
            <ul className="footer-links">
              <li><a href="#sobre">Sobre nós</a></li>
              <li><a href="#contato">Contato</a></li>
              <li><a href="#faq">Perguntas frequentes</a></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Copyright e redes sociais */}
        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 NutriFlow</p>

          <div className="footer-social">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://www.facebook.com/"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-facebook"></i>
            </a>
            <a
              href="https://www.youtube.com/"
              aria-label="YouTube"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}