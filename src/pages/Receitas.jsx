import { receitas } from '../data/alimentos'

export default function Receitas() {
  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Receitas</p>
        <h2 className="fw-bold mb-0">Sugestões práticas para o dia a dia</h2>
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
                <ul className="small text-secondary mb-0 ps-3">
                  {receita.ingredientes.map((ingrediente) => (
                    <li key={`${receita.id}-${ingrediente.nome}`}>{ingrediente.nome}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}
