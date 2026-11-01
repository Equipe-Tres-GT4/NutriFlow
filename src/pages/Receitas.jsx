import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../context/RecipeContext'

export default function Receitas() {
  const { recipes, savedRecipeIds, toggleSaveRecipe, rateRecipe, cloneRecipe } = useRecipes()
  const [busca, setBusca] = useState('')

  const handleClone = (id) => {
    const cloned = cloneRecipe(id)
    if (cloned) {
      // Se clonar, podemos redirecionar ou lidar com a edição se necessário
    }
  }

  // Filtragem das receitas com base no nome ou título digitado na lupa
  const receitasFiltradas = recipes.filter((recipe) => {
    const nome = recipe.nome || recipe.title || ''
    return nome.toLowerCase().includes(busca.toLowerCase())
  })

  return (
    <main className="container py-5">
      {/* CABEÇALHO */}
      <div className="text-center mx-auto mb-5" style={{ maxWidth: '750px' }}>
        <h1 className="fw-bold mb-3" style={{ color: '#1b4332' }}>
          Receitas da comunidade
        </h1>
        <p className="text-secondary mb-4 mx-auto">
          Explore receitas deliciosas e saudáveis compartilhadas por nossa comunidade. Encontre inspiração para a sua rotina alimentar de forma simples e acessível.
        </p>

        {/* CAMPO DE PESQUISA (PARA A LUPA FUNCIONAR) */}
        <div className="input-group bg-white rounded-pill shadow-sm p-1 border mb-4 mx-auto" style={{ maxWidth: '500px' }}>
          <span className="input-group-text bg-transparent border-0 ps-3">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            id="input-busca-receitas"
            className="form-control border-0 shadow-none ps-2"
            placeholder="Buscar receitas por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button
              type="button"
              className="btn btn-link text-secondary text-decoration-none border-0 pe-3"
              onClick={() => setBusca('')}
            >
              Limpar
            </button>
          )}
        </div>

        {/* BOTÃO CADASTRAR NOVA RECEITA (REDRECIONA PARA A PÁGINA DEDICADA) */}
        <Link
          to="/receitas/cadastrar"
          className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2 text-decoration-none"
          style={{ backgroundColor: '#1b4332' }}
        >
          <i className="bi bi-plus-lg"></i>
          Cadastrar Nova Receita
        </Link>
      </div>

      {/* GRID DE RECEITAS FILTRADAS */}
      {receitasFiltradas.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Nenhuma receita encontrada com o termo "{busca}".
        </div>
      ) : (
        <div className="row g-4">
          {receitasFiltradas.map((recipe) => {
            const id = String(recipe.id || recipe.title || recipe.nome)
            const nome = recipe.nome || recipe.title
            const tempo = recipe.tempo || recipe.time || '20 min'
            const nota = Number(recipe.nota || recipe.rating || 4.8).toFixed(1)
            const autor = recipe.author || recipe.autor || 'Comunidade'
            const dificuldade = recipe.dificuldade || recipe.difficulty || 'Fácil'
            const imagem = recipe.imagem || recipe.image || '/boloCenoura.jpg'
            const isSaved = savedRecipeIds ? savedRecipeIds.includes(id) : false

            return (
              <div className="col-12 col-md-6 col-lg-4" key={id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                  {/* BOTÕES FLUTUANTES (CLONAR E SALVAR) */}
                  <div className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2" style={{ zIndex: 2 }}>
                    <button
                      type="button"
                      onClick={() => handleClone(id)}
                      title="Clonar esta receita"
                      className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36 }}
                    >
                      <i className="bi bi-copy text-secondary"></i>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSaveRecipe(id)}
                      title={isSaved ? 'Remover dos salvos' : 'Salvar receita'}
                      className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36 }}
                    >
                      <i className={`bi ${isSaved ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`}></i>
                    </button>
                  </div>

                  {/* IMAGEM */}
                  <img
                    src={imagem}
                    alt={nome}
                    className="w-100"
                    style={{ height: 200, objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'
                    }}
                  />

                  {/* CORPO DO CARD */}
                  <div className="card-body d-flex flex-column justify-content-between p-4">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-1">{nome}</h5>
                      <p className="text-secondary small mb-3">Por {autor}</p>

                      <div className="d-flex align-items-center justify-content-between small text-secondary mb-3">
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          {tempo}
                        </span>
                        <span className="badge bg-light text-dark border">
                          {dificuldade}
                        </span>
                      </div>

                      {/* AVALIAÇÃO DE 1 A 5 ESTRELAS */}
                      <div className="d-flex align-items-center gap-1 mb-3">
                        <span className="small text-muted me-1">Avaliar:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => rateRecipe(id, star)}
                            title={`Dar ${star} estrelas`}
                            className="btn btn-link p-0 text-decoration-none"
                            style={{ cursor: 'pointer' }}
                          >
                            <i
                              className={`bi ${
                                star <= Math.round(Number(nota))
                                  ? 'bi-star-fill text-warning'
                                  : 'bi-star text-secondary opacity-50'
                              }`}
                            ></i>
                          </button>
                        ))}
                        <span className="small fw-bold ms-1 text-dark">
                          {nota} ({recipe.ratingCount || 1})
                        </span>
                      </div>

                      {/* TAGS */}
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {recipe.tags && recipe.tags.length > 0 ? (
                          recipe.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="badge bg-success-subtle text-success border border-success-subtle rounded-pill"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                            Sem alérgenos
                          </span>
                        )}
                      </div>

                      <small className="text-muted d-block mb-3" style={{ fontSize: '0.72rem' }}>
                        *Etiquetas autodeclaradas pelo autor
                      </small>
                    </div>

                    {/* BOTÃO VER RECEITA */}
                    <Link
                      to={`/receitas/${encodeURIComponent(id)}`}
                      className="btn btn-outline-success w-100 rounded-3 fw-semibold py-2"
                    >
                      Ver receita
                    </Link>
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