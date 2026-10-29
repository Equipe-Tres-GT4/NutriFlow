import { Link } from 'react-router-dom'
import { alimentos } from '../data/alimentos'
import './Visualizacao.css'

export default function Visualizacao() {
  return (
    <main className="nf-vitrine">
      <section className="vitrine-hero">
        <div className="vitrine-hero-texto">
          <span className="vitrine-sobretitulo">Nutrição que acompanha você</span>
          <h1>Faça escolhas melhores, no seu ritmo.</h1>
          <p>
            Consulte informações de alimentos, descubra receitas e encontre novas
            ideias para a sua rotina alimentar.
          </p>
          <div className="vitrine-acoes">
            <Link to="/cadastro" className="vitrine-botao vitrine-botao-principal">
              Criar minha conta <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
            </Link>
            <Link to="/login" className="vitrine-link-entrar">Já tenho cadastro</Link>
          </div>
          <div className="vitrine-destaques" aria-label="Recursos do NutriFlow">
            <span><i className="bi bi-search" aria-hidden="true"></i> Catálogo de alimentos</span>
            <span><i className="bi bi-book" aria-hidden="true"></i> Receitas para explorar</span>
          </div>
        </div>
        <div className="vitrine-hero-imagem">
          <img src="/panqueca.jpg" alt="Panqueca" />
          <div className="vitrine-legenda-imagem">
            <span>Ideias para o dia a dia</span>
            <strong>Comida de verdade, com informação.</strong>
          </div>
          <span className="vitrine-selo-imagem"><i className="bi bi-flower1" aria-hidden="true"></i></span>
        </div>
      </section>

      <section className="vitrine-secao vitrine-alimentos" aria-labelledby="titulo-alimentos">
        <div className="vitrine-cabecalho-secao">
          <div>
            <span className="vitrine-sobretitulo">Informação à mesa</span>
            <h2 id="titulo-alimentos">Conheça o que faz parte da sua rotina</h2>
          </div>
          <Link to="/login" className="vitrine-link-seta">
            Explorar catálogo <i className="bi bi-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
        <div className="vitrine-lista-alimentos">
          {alimentos.slice(0, 4).map((alimento, index) => (
            <Link to="/login" className="vitrine-alimento" key={alimento.id}>
              <span className="vitrine-numero">0{index + 1}</span>
              <img src={alimento.imagem} alt="" loading="lazy" />
              <span className="vitrine-alimento-info">
                <strong>{alimento.nome}</strong>
                <small>{alimento.marca || 'Alimento in natura'}</small>
              </span>
              <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
            </Link>
          ))}
        </div>
      </section>

      <section className="vitrine-convite">
        <div>
          <span className="vitrine-sobretitulo">Seu próximo passo</span>
          <h2>Continue a descoberta com o NutriFlow.</h2>
        </div>
        <div className="vitrine-acoes">
          <Link to="/cadastro" className="vitrine-botao vitrine-botao-claro">
            Começar agora <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
          </Link>
          <Link to="/login" className="vitrine-link-claro">Entrar na minha conta</Link>
        </div>
      </section>
    </main>
  )
}