import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaLeaf, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="nf-footer mt-5 py-5">
      <Container>
        <Row className="g-4">
          <Col xs={12} md={5}>
            <h5 className="fw-bold">
              <FaLeaf className="me-2" />
              NutriFlow
            </h5>
            <p className="small opacity-75">
              Alimentação consciente, vida melhor.
            </p>
          </Col>

          <Col xs={6} md={3}>
            <h6 className="fw-bold">Links rápidos</h6>
            <ul className="list-unstyled small">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/pesquisa">Pesquisa</Link></li>
              <li><Link to="/receitas">Receitas</Link></li>
            </ul>
          </Col>

          <Col xs={6} md={4}>
            <h6 className="fw-bold">Suporte</h6>
            <ul className="list-unstyled small">
              <li><a href="#sobre">Sobre nós</a></li>
              <li><a href="#contato">Contato</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </Col>
        </Row>

        <hr />

        <Row className="align-items-center gy-3">
          <Col xs={12} md={8}>
            <small>
              © {new Date().getFullYear()} NutriFlow.
              Todos os direitos reservados.
            </small>
          </Col>

          <Col xs={12} md={4} className="nf-redes-sociais">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.youtube.com/"
              aria-label="YouTube"
              target="_blank"
              rel="noreferrer"
            >
              <FaYoutube />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}