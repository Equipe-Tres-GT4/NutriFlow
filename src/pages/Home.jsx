import { useState } from 'react'
import { receitas } from '../data/receitas'

const FILTROS = [
  { id: 'gluten', label: 'Sem glúten', icone: 'bi-ban', tipo: 'evitar', valor: 'glúten' },
  { id: 'lactose', label: 'Sem lactose', icone: 'bi-droplet', tipo: 'evitar', valor: 'lactose' },
  { id: 'vegetariano', label: 'Vegetariano', icone: 'bi-flower1', tipo: 'exigir', valor: 'vegetariano' },
  { id: 'vegano', label: 'Vegano', icone: 'bi-heart', tipo: 'exigir', valor: 'vegano' },
]

export default function Home() {
  const [ativos, setAtivos] = useState([])
  const [busca, setBusca] = useState('')

  const alternar = (id) =>
    setAtivos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  const filtrosAtivos = FILTROS.filter((f) => ativos.includes(f.id))

  const lista = receitas.filter((r) => {
    const passaBusca = r.nome.toLowerCase().includes(busca.toLowerCase())
    const passaFiltros = filtrosAtivos.every((f) =>
      f.tipo === 'evitar'
        ? !r.ingredientes.some((i) => i.alergenos.includes(f.valor))
        : r.tags.includes(f.valor)
    )
    return passaBusca && passaFiltros
  })

  return (
    <>
      {/* HERO */}
      <section className="nf-hero p-4 p-md-5 mb-4">
        <div className="row align-items-center g-4">
          <div className="col-md-6">
            <h1 className="display-5">Comida boa é<br />vida que flui!</h1>
            <p className="text-secondary my-3">
              Descubra alimentos, receitas e informações para uma alimentação mais saudável
              e adequada às suas necessidades.
            </p>
            <div className="input-group shadow-sm rounded-3 overflow-hidden">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
              <input
                className="form-control border-0"
                placeholder="Buscar alimentos, receitas ou ingredientes..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 text-center">
            <img src="/img/panqueca.jpg" alt="Bowl de alimentos saudáveis" className="img-fluid" style={{ maxHeight: 320, width: 320, objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* FILTROS RÁPIDOS */}
      <section className="row g-3 mb-5">
        {FILTROS.map((f) => (
          <div className="col-6 col-md-3" key={f.id}>
            <button className={`nf-chip ${ativos.includes(f.id) ? 'ativo' : ''}`} onClick={() => alternar(f.id)}>
              <span className="nf-chip-icone"><i className={`bi ${f.icone}`}></i></span>
              <div>{f.label}</div>
            </button>
          </div>
        ))}
      </section>

      {/* Alimentos */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Receitas em destaque</h4>
          <span className="small text-secondary">{lista.length} resultado(s)</span>
        </div>

        {lista.length === 0 && (
          <div className="alert alert-light border">Nenhuma receita encontrada com esses filtros.</div>
        )}

        <div className="row g-4">
          {lista.map((r) => {
            const alergenos = [...new Set(r.ingredientes.flatMap((i) => i.alergenos))]
            return (
              <div className="col-12 col-md-6 col-lg-4" key={r.id}>
                <article className="nf-card h-100">
                  <img src={r.imagem} alt={r.nome} className="w-100" />
                  <div className="p-3">
                    <h6 className="fw-bold">{r.nome}</h6>
                    <p className="small text-secondary mb-2">
                      <i className="bi bi-clock me-1"></i>{r.tempo}
                      <span className="ms-3 text-warning"><i className="bi bi-star-fill"></i> {r.nota}</span>
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      {alergenos.length === 0 ? (
                        <span className="badge nf-selo">Sem alérgenos</span>
                      ) : (
                        alergenos.map((a) => <span key={a} className="badge nf-selo-alerta">Contém {a}</span>)
                      )}
                    </div>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
