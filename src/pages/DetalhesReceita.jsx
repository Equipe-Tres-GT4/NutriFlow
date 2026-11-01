import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import IngredientsList from '../components/IngredientsList'
import NutritionCard from '../components/NutritionCard'
import PreparationSteps from '../components/PreparationSteps'
import { useRecipes } from '../context/RecipeContext'

const criarSlug = (valor) =>
  String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export default function DetalhesReceita() {
  const { id } = useParams()
  const { recipes, savedRecipeIds, toggleSaveRecipe } = useRecipes()
  const [compartilhado, setCompartilhado] = useState(false)
  const receita = recipes.find((item) => {
    const receitaId = String(item.id || item.title || item.nome)
    const nome = item.title || item.nome
    return receitaId === id || criarSlug(nome) === id
  })

  if (!receita) {
    return (
      <main className="container py-5 text-center">
        <h1 className="h3 fw-bold">Receita não encontrada</h1>
        <p className="text-secondary mb-4">Ela pode ter sido removida ou o link está incorreto.</p>
        <Link to="/receitas" className="btn btn-success">Voltar para receitas</Link>
      </main>
    )
  }

  const nome = receita.nome || receita.title || 'Receita'
  const autor = receita.author || receita.autor || 'Comunidade'
  const tempo = receita.tempoPreparo || receita.tempo || receita.time
  const imagem = receita.imagem || receita.image
  const ingredientes = receita.ingredientes || receita.ingredients || []
  const passos = receita.modoPreparo || receita.passos || receita.preparationSteps || []
  const porcoes = Number(receita.porcoes || receita.servings || 1)
  const etiquetas = receita.tags || receita.etiquetas || []
  const salvo = savedRecipeIds.includes(String(receita.id || receita.title || receita.nome))
  const nutricional = receita.nutricao || receita.nutrition

  const compartilhar = async () => {
    if (!navigator.clipboard) return
    await navigator.clipboard.writeText(window.location.href)
    setCompartilhado(true)
    window.setTimeout(() => setCompartilhado(false), 2000)
  }

  const receitaId = String(receita.id || receita.title || receita.nome);
  const titulo = receita.nome || receita.title;
  const autor = receita.author || receita.autor || "Comunidade";
  const tempo = receita.tempo || receita.time || "20 min";
  const nota = Number(receita.nota || receita.rating || 4.8).toFixed(1);
  const avaliacaoTexto = `${nota} (${receita.ratingCount || 1} avaliação)`;
  const imagem = receita.imagem || receita.image || "/boloCenoura.jpg";
  const tags = receita.tags || ["Sem alérgenos", "Fácil"];
  const porcoesBase = receita.porcoesBase || 2;
  const isSaved = savedRecipeIds ? savedRecipeIds.includes(receitaId) : false;

  const ingredientesFormatados = Array.isArray(receita.ingredientes)
    ? receita.ingredientes.map(item => typeof item === 'string' ? { qtdBase: 1, unidade: "", nome: item } : item)
    : [{ qtdBase: 1, unidade: "", nome: receita.ingredientes || "Ingredientes não especificados" }];

  const passosFormatados = Array.isArray(receita.preparo) 
    ? receita.preparo 
    : (receita.passos || [receita.preparo || "Modo de preparo não informado."]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link da receita copiado para a área de transferência!');
  };

  return (
    <main className="container py-4 py-lg-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <Link to="/receitas" className="btn btn-outline-success">
          <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
          Voltar para receitas
        </Link>
        <div className="d-flex gap-2">
          <button
            type="button"
            className={`btn ${salvo ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => toggleSaveRecipe(String(receita.id || receita.title || receita.nome))}
            aria-pressed={salvo}
          >
            <i className={`bi ${salvo ? 'bi-heart-fill' : 'bi-heart'} me-2`} aria-hidden="true"></i>
            {salvo ? 'Salva' : 'Salvar'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={compartilhar}>
            <i className="bi bi-share me-2" aria-hidden="true"></i>
            {compartilhado ? 'Link copiado' : 'Compartilhar'}
          </button>

          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={() => toggleSaveRecipe(receitaId)}
              className="btn bg-white border px-4 py-2 rounded-pill fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-2 transition-all"
              style={{ borderColor: '#E5E7EB', fontSize: '0.9rem' }}
            >
              {isSaved ? <i className="bi bi-heart-fill text-danger"></i> : <i className="bi bi-heart"></i>} 
              <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="btn bg-white border px-4 py-2 rounded-pill fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-2 transition-all"
              style={{ borderColor: '#E5E7EB', fontSize: '0.9rem' }}
            >
              <i className="bi bi-share"></i> Compartilhar
            </button>
          </div>
        </div>

      <div className="row g-4 g-lg-5">
        <section className="col-12 col-lg-7">
          <h1 className="h2 fw-bold mb-2" style={{ color: '#1b4332' }}>{nome}</h1>
          <div className="d-flex flex-wrap gap-3 text-secondary small mb-3">
            <span>Por {autor}</span>
            {tempo && <span><i className="bi bi-clock me-1" aria-hidden="true"></i>{tempo}</span>}
            {receita.dificuldade && <span>{receita.dificuldade}</span>}
          </div>

          {etiquetas.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {etiquetas.map((etiqueta) => (
                <span key={etiqueta} className="badge rounded-pill text-bg-success-subtle border border-success-subtle text-success-emphasis">
                  {etiqueta}
                </span>
              ))}
            </div>
          )}

          {imagem && (
            <img
              src={imagem}
              alt={nome}
              className="img-fluid w-100 rounded-4 mb-4"
              style={{ maxHeight: 440, objectFit: 'cover' }}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&auto=format&fit=crop&q=80'
              }}
            />
          )}

          {receita.descricao && <p className="text-secondary mb-4">{receita.descricao}</p>}

          {nutricional && (
            <section aria-labelledby="nutrition-title">
              <h2 id="nutrition-title" className="h5 fw-bold mb-3">Informação nutricional</h2>
              <div className="row g-2">
                {Object.entries(nutricional).map(([label, valor]) => (
                  <div className="col-6 col-md-3" key={label}>
                    <NutritionCard valor={valor} label={label} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="col-12 col-lg-5">
          <div className="bg-light border rounded-4 p-3 p-md-4">
            <IngredientsList porcoesIniciais={porcoes} ingredientesBase={ingredientes} />
            {passos.length > 0 && <hr className="my-4" />}
            {passos.length > 0 && <PreparationSteps passos={passos} />}
          </div>
        </aside>
      </div>
    </main>
  )
}