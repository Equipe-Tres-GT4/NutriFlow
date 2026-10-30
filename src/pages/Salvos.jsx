import React from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../context/RecipeContext'

export default function Salvos() {
  const { recipes, savedRecipeIds, toggleSaveRecipe } = useRecipes()

  const receitasSalvas = recipes.filter((r) =>
    savedRecipeIds ? savedRecipeIds.includes(String(r.id || r.title || r.nome)) : false
  )

  return (
    <main className="container py-5">
      {/* CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1b4332' }}>
            <i className="bi bi-bookmark-fill text-danger fs-4"></i>
            Receitas Salvas
          </h2>
          <p className="text-secondary mb-0 small">
            Todas as receitas que você guardou para fazer depois.
          </p>
        </div>
        <Link
          to="/receitas"
          className="btn btn-outline-success rounded-pill px-4 btn-sm fw-semibold"
          style={{ borderColor: '#1b4332', color: '#1b4332' }}
        >
          Explorar Mais
        </Link>
      </div>

      {/* ESTADO VAZIO OU LISTAGEM */}
      {receitasSalvas.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center mx-auto my-4" style={{ maxWidth: '850px' }}>
          <div className="mx-auto mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-bookmark text-secondary opacity-50 display-4"></i>
          </div>
          <h4 className="fw-bold text-dark mb-2">
            Você ainda não salvou nenhuma receita
          </h4>
          <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '420px' }}>
            Explore as receitas disponíveis no site e clique no ícone de coração para guardá-las aqui.
          </p>
          <div>
            <Link
              to="/receitas"
              className="btn text-white rounded-3 px-4 py-2 fw-medium shadow-sm"
              style={{ backgroundColor: '#1b4332' }}
            >
              Ver Receitas
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {receitasSalvas.map((recipe) => {
            const id = String(recipe.id || recipe.title || recipe.nome)
            const nome = recipe.nome || recipe.title
            const tempo = recipe.tempo || recipe.time || '20 min'
            const nota = Number(recipe.nota || recipe.rating || 4.8).toFixed(1)
            const imagem = recipe.imagem || recipe.image || '/boloCenoura.jpg'

            return (
              <div className="col-12 col-md-6 col-lg-4" key={id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                  <button
                    type="button"
                    onClick={() => toggleSaveRecipe(id)}
                    className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center"
                    style={{ width: 36, height: 36, zIndex: 2 }}
                    title="Remover dos salvos"
                  >
                    <i className="bi bi-heart-fill text-danger"></i>
                  </button>

                  <img
                    src={imagem}
                    alt={nome}
                    className="w-100"
                    style={{ height: 180, objectFit: 'cover' }}
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

                    <div className="d-flex flex-wrap gap-1">
                      {recipe.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="badge bg-success-subtle text-success border border-success-subtle rounded-pill"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}