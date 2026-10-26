import { receitas } from '../data/alimentos'

export default function Pesquisa() {
  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <p className="text-primary fw-semibold mb-1">Busca inteligente</p>
          <h2 className="fw-bold mb-0">Descubra opções que combinam com seu estilo de vida</h2>
        </div>
      </div>

      <div className="row g-4">
        {receitas.map((receita) => (
          <div className="col-12 col-md-6 col-lg-4" key={receita.id}>
            <article className="nf-card h-100 overflow-hidden">
              <img src={receita.imagem} alt={receita.nome} className="w-100" style={{ height: 200, objectFit: 'cover' }} />
              <div className="p-3">
                <h5 className="fw-bold mb-2">{receita.nome}</h5>
                <p className="small text-secondary mb-2">
                  <i className="bi bi-clock me-1"></i>{receita.tempo}
                  <span className="ms-3 text-warning"><i className="bi bi-star-fill me-1"></i>{receita.nota}</span>
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {receita.tags.map((tag) => (
                    <span key={tag} className="badge nf-selo">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}
