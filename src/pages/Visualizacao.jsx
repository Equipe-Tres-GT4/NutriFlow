
import { Link } from 'react-router-dom'
import './Visualizacao.css'

export default function Visualizacao() {
  return (
    <main className="container py-5">
      <section className="row align-items-center g-5 py-md-5">
        <div className="col-lg-6">
          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-3">
            Sua comunidade alimentar
          </span>

          <h1
            className="display-5 fw-bold"
            style={{ color: '#194a31' }}
          >
            Compartilhe receitas, descubra alimentos,
            cuide da sua rotina.
          </h1>

          <p className="lead text-secondary my-4">
            O NutriFlow aproxima pessoas que querem fazer
            escolhas alimentares mais conscientes.
            Pesquise produtos reais, aprenda com receitas
            e converse com a comunidade.
          </p>

          <div className="d-flex flex-wrap gap-3">
            <Link
              to="/cadastro"
              className="btn btn-success btn-lg px-4"
            >
              Começar gratuitamente
            </Link>

            <Link
              to="/comunidade"
              className="btn btn-outline-success btn-lg px-4"
            >
              Conhecer a comunidade
            </Link>
          </div>
        </div>

        <div className="col-lg-6">
          <img
            src="/panqueca.jpg"
            alt="Prato de panquecas"
            className="img-fluid rounded-4 shadow-sm"
            style={{
              maxHeight: 420,
              width: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </section>

      <section
        className="row g-4 my-4"
        aria-label="O que posso fazer no NutriFlow"
      >
        <div className="col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100">
            <i className="bi bi-search display-6 text-success" />

            <h2 className="h4 mt-3">
              Entender um rótulo
            </h2>

            <p className="text-secondary">
              Consulte produtos por nome ou código
              de barras e encontre informações nutricionais.
            </p>

            <Link to="/receitas">
              Explorar receitas e ingredientes
            </Link>
          </div>
        </div>

        <div className="col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100">
            <i className="bi bi-journal-text display-6 text-success" />

            <h2 className="h4 mt-3">
              Cozinhar melhor
            </h2>

            <p className="text-secondary">
              Encontre receitas reais ou publique
              suas próprias ideias na comunidade.
            </p>

            <Link to="/receitas">
              Explorar receitas
            </Link>
          </div>
        </div>

        <div className="col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100">
            <i className="bi bi-people display-6 text-success" />

            <h2 className="h4 mt-3">
              Conversar e apoiar
            </h2>

            <p className="text-secondary">
              Compartilhe suas experiências,
              comente e acompanhe outras pessoas.
            </p>

            <Link to="/comunidade">
              Ver publicações
            </Link>
          </div>
        </div>
      </section>

      <p className="small text-secondary text-center mt-5">
        Dados nutricionais colaborativos são informativos;
        não substituem a orientação de profissionais de saúde.
      </p>
    </main>
  )
}
