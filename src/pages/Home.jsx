import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { receitas as dadosReceitas } from '../data/receitas'
import { useRecipes } from '../context/RecipeContext'

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

  const { recipes: receitasGlobais, savedRecipeIds, toggleSaveRecipe } = useRecipes()

  const baseReceitas = useMemo(() => {
    if (Array.isArray(receitasGlobais) && receitasGlobais.length > 0) {
      return receitasGlobais
    }
    return Array.isArray(dadosReceitas) ? dadosReceitas : []
  }, [receitasGlobais])

  const alternarFiltro = (id) => {
    setFiltrosAtivos((atuais) =>
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]
    )
  }

  // Score ponderado: Nota de Avaliação (70%) + Volume de Salvos (30%)
  const calcularScore = (receita) => {
    if (!receita) return 0
    const nota = Number(receita.rating || receita.nota || 4.5)
    const salvos = Number(receita.savesCount || receita.salvos || 0)
    const notaValida = isNaN(nota) ? 0 : nota
    const salvosValidos = isNaN(salvos) ? 0 : salvos
    return notaValida * 0.7 + Math.min(salvosValidos, 30) * 0.1
  }

  const listaProcessada = useMemo(() => {
    if (!Array.isArray(baseReceitas)) return []

    const filtradas = baseReceitas.filter((receita) => {
      if (!receita) return false
      const nome = receita.nome || receita.title || ''
      const atendeBusca = nome.toLowerCase().includes((busca || '').toLowerCase())

      const regrasAtivas = FILTROS.filter((f) => filtrosAtivos.includes(f.id))
      const atendeFiltros = regrasAtivas.every((filtro) => {
        if (filtro.tipo === 'evitar') {
          let listaAlergenos = []
          if (Array.isArray(receita.ingredientes)) {
            listaAlergenos = receita.ingredientes.flatMap((i) =>
              typeof i === 'object' && i !== null && Array.isArray(i.alergenos)
                ? i.alergenos
                : []
            )
          }
          return !listaAlergenos.includes(filtro.valor)
        }
        const tags = Array.isArray(receita.tags) ? receita.tags : []
        return tags.includes(filtro.valor)
      })

      return atendeBusca && atendeFiltros
    })

    const ordenadas = [...filtradas].sort((a, b) => calcularScore(b) - calcularScore(a))

    if (!busca && filtrosAtivos.length === 0) {
      return ordenadas.slice(0, 6)
    }

    return ordenadas
  }, [baseReceitas, busca, filtrosAtivos])

  return (
    <main className="container py-4">
      {/* HERO SECTION ORIGINAL (SEM IMAGEM DE ARROZ) */}
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
                    estaAtivo ? 'text-white' : 'bg-white text-dark'
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
            <small className="text-secondary">
              {!busca && filtrosAtivos.length === 0
                ? 'Top 6 receitas mais bem avaliadas e populares'
                : `${listaProcessada.length} resultado(s) ordenados por pontuação`}
            </small>
          </div>
          <Link to="/receitas" className="small fw-bold text-decoration-none" style={{ color: '#1b4332' }}>
            Ver todas <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {listaProcessada.length === 0 ? (
          <div className="alert alert-light border text-center py-5 text-secondary rounded-4">
            Nenhuma receita encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="row g-4">
            {listaProcessada.map((receita) => {
              const id = String(receita.id || receita.title || receita.nome)
              const nome = receita.nome || receita.title
              const tempo = receita.tempo || receita.time || '20 min'
              const nota = Number(receita.nota || receita.rating || 4.8).toFixed(1)
              const imagem = receita.imagem || receita.image || '/img/panqueca.jpg'
              const isFav = savedRecipeIds ? savedRecipeIds.includes(id) : false

              const alergenos = Array.isArray(receita.ingredientes)
                ? [
                    ...new Set(
                      receita.ingredientes.flatMap((i) =>
                        typeof i === 'object' && i !== null && Array.isArray(i.alergenos)
                          ? i.alergenos
                          : []
                      )
                    ),
                  ]
                : []

              return (
                <div className="col-12 col-md-6 col-lg-4" key={id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                    <button
                      type="button"
                      onClick={() => toggleSaveRecipe(id)}
                      title={isFav ? 'Remover dos salvos' : 'Salvar receita'}
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
                          {receita.savesCount !== undefined && (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              ({receita.savesCount} salvos)
                            </span>
                          )}
                        </div>
                      </div>

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