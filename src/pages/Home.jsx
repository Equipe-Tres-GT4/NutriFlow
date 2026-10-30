import React, { useState } from 'react'
import { receitas as dadosReceitas } from '../data/receitas'

// Configuração dos filtros com ícones nativos do Bootstrap (bi bi-*)
const FILTROS = [
  { id: 'gluten', label: 'Sem glúten', icone: 'bi-slash-circle', tipo: 'evitar', valor: 'glúten' },
  { id: 'lactose', label: 'Sem lactose', icone: 'bi-droplet', tipo: 'evitar', valor: 'lactose' },
  { id: 'vegetariano', label: 'Vegetariano', icone: 'bi-flower1', tipo: 'exigir', valor: 'vegetariano' },
  { id: 'vegano', label: 'Vegano', icone: 'bi-heart-fill', tipo: 'exigir', valor: 'vegano' },
]

const CATEGORIAS = [
  { name: 'Frutas', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop&q=60' },
  { name: 'Legumes', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=60' },
  { name: 'Grãos', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60' },
  { name: 'Proteínas', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60' },
  { name: 'Laticínios', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&auto=format&fit=crop&q=60' },
]

export default function Home() {
  const [busca, setBusca] = useState('')
  const [filtrosAtivos, setFiltrosAtivos] = useState([])
  const [favoritos, setFavoritos] = useState([])

  // Alterna ativação dos filtros
  const alternarFiltro = (id) => {
    setFiltrosAtivos((atuais) =>
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]
    )
  }

  // Alterna receitas favoritadas
  const alternarFavorito = (id) => {
    setFavoritos((atuais) =>
      atuais.includes(id) ? atuais.filter((favId) => favId !== id) : [...atuais, id]
    )
  }

  // Filtragem combinando busca de texto e regras de alérgenos/tags
  const listaFiltrada = (dadosReceitas || []).filter((receita) => {
    const nome = receita.nome || receita.title || ''
    const atendeBusca = nome.toLowerCase().includes(busca.toLowerCase())

    const regrasAtivas = FILTROS.filter((f) => filtrosAtivos.includes(f.id))
    const atendeFiltros = regrasAtivas.every((filtro) => {
      if (filtro.tipo === 'evitar') {
        const alergenos = receita.ingredientes?.flatMap((i) => i.alergenos || []) || []
        return !alergenos.includes(filtro.valor)
      }
      const tags = receita.tags || []
      return tags.includes(filtro.valor)
    })

    return atendeBusca && atendeFiltros
  })

  return (
    <main className="container py-4">
      {/* HERO SECTION */}
      <section className="p-4 p-md-5 mb-5 rounded-4" style={{ backgroundColor: '#e8f0e6' }}>
        <div className="row align-items-center g-4">
          <div className="col-12 col-md-7">
            <h1 className="display-6 fw-bold mb-3" style={{ color: '#1b4332' }}>
              Comida boa é<br />vida que flui!
            </h1>
            <p className="text-secondary mb-4">
              Descubra alimentos, receitas e informações para uma alimentação mais saudável e adequada às suas necessidades.
            </p>

            {/* BARRA DE PESQUISA */}
            <div className="input-group bg-white rounded-pill shadow-sm p-1 border">
              <span className="input-group-text bg-transparent border-0 ps-3">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none ps-2"
                placeholder="Buscar alimentos, receitas ou ingredientes..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none border-0"
                  onClick={() => setBusca('')}
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-5 text-center">
            <img
              src="/img/panqueca.jpg"
              alt="Prato saudável"
              className="rounded-circle shadow border border-4 border-white img-fluid"
              style={{ width: 260, height: 260, objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60'
              }}
            />
          </div>
        </div>
      </section>

      {/* FILTROS RÁPIDOS */}
      <section className="mb-5">
        <div className="row g-3">
          {FILTROS.map((filtro) => {
            const estaAtivo = filtrosAtivos.includes(filtro.id)
            return (
              <div className="col-6 col-md-3" key={filtro.id}>
                <button
                  type="button"
                  onClick={() => alternarFiltro(filtro.id)}
                  className={`btn w-100 p-3 rounded-4 d-flex flex-column align-items-center justify-content-center shadow-sm border transition-all ${
                    estaAtivo
                      ? 'text-white'
                      : 'bg-white text-dark'
                  }`}
                  style={{
                    backgroundColor: estaAtivo ? '#1b4332' : '#ffffff',
                    borderColor: estaAtivo ? '#1b4332' : '#e9ecef',
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: estaAtivo ? 'rgba(255, 255, 255, 0.2)' : '#e8f0e6',
                      color: estaAtivo ? '#ffffff' : '#1b4332',
                    }}
                  >
                    <i className={`bi ${filtro.icone} fs-5`}></i>
                  </div>
                  <span className="fw-semibold small">{filtro.label}</span>
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* CATEGORIAS EM DESTAQUE */}
      <section className="mb-5">
        <h5 className="fw-bold text-dark mb-3">Categorias em destaque</h5>
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3">
          {CATEGORIAS.map((cat, index) => (
            <div className="col" key={index}>
              <div
                className="card h-100 border-0 shadow-sm rounded-4 text-center p-2"
                style={{ cursor: 'pointer' }}
                onClick={() => setBusca(cat.name)}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="rounded-3 mb-2 w-100"
                  style={{ height: 95, objectFit: 'cover' }}
                />
                <span className="small fw-bold text-secondary">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECEITAS EM DESTAQUE */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold text-dark mb-0">Receitas em destaque</h5>
            <small className="text-secondary">{listaFiltrada.length} resultado(s)</small>
          </div>
          <a href="/receitas" className="small fw-bold text-decoration-none" style={{ color: '#1b4332' }}>
            Ver todas <i className="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        {listaFiltrada.length === 0 ? (
          <div className="alert alert-light border text-center py-5 text-secondary rounded-4">
            Nenhuma receita encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="row g-4">
            {listaFiltrada.map((receita) => {
              const id = receita.id || receita.title || receita.nome
              const nome = receita.nome || receita.title
              const tempo = receita.tempo || receita.time || '20 min'
              const nota = receita.nota || receita.rating || '4.8'
              const imagem = receita.imagem || receita.image || '/img/panqueca.jpg'
              const isFav = favoritos.includes(id)
              const alergenos = [...new Set(receita.ingredientes?.flatMap((i) => i.alergenos || []) || [])]

              return (
                <div className="col-12 col-md-6 col-lg-4" key={id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                    {/* Botão de Favoritar */}
                    <button
                      type="button"
                      onClick={() => alternarFavorito(id)}
                      className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36, zIndex: 2 }}
                    >
                      <i className={`bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`}></i>
                    </button>

                    <img
                      src={imagem}
                      alt={nome}
                      className="w-100"
                      style={{ height: 180, objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'
                      }}
                    />

                    <div className="card-body d-flex flex-column justify-content-between p-3">
                      <div>
                        <h6 className="card-title fw-bold text-dark text-truncate mb-2">{nome}</h6>
                        <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
                          <span>
                            <i className="bi bi-clock me-1"></i>
                            {tempo}
                          </span>
                          <span className="text-warning fw-semibold">
                            <i className="bi bi-star-fill me-1"></i>
                            {nota}
                          </span>
                        </div>
                      </div>

                      {/* Selos de Alérgenos */}
                      <div className="d-flex flex-wrap gap-1">
                        {alergenos.length === 0 ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                            Sem alérgenos
                          </span>
                        ) : (
                          alergenos.map((alerg) => (
                            <span
                              key={alerg}
                              className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill"
                            >
                              Contém {alerg}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}