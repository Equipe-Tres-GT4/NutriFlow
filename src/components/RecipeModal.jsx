import React, { useState, useEffect } from 'react'
import { useRecipes } from '../context/RecipeContext'

export default function RecipeModal({ isOpen, onClose, initialData }) {
  const { addRecipe } = useRecipes()

  const [formData, setFormData] = useState({
    title: '',
    time: '20 min',
    difficulty: 'Fácil',
    image: '/boloCenoura.jpg',
    tags: 'Sem Alérgenos',
    ingredients: '',
    instructions: '',
  })

  useEffect(() => {
    if (initialData) {
      // Normalização: extrai strings mesmo se o array original tiver objetos { nome, alergenos }
      let parsedIngredients = ''
      const rawIngredients = initialData.ingredients || initialData.ingredientes

      if (Array.isArray(rawIngredients)) {
        parsedIngredients = rawIngredients
          .map((item) => (typeof item === 'string' ? item : item.nome || item.name || ''))
          .filter(Boolean)
          .join('\n')
      } else if (typeof rawIngredients === 'string') {
        parsedIngredients = rawIngredients
      }

      setFormData({
        title: initialData.title || initialData.nome || '',
        time: initialData.time || initialData.tempo || '20 min',
        difficulty: initialData.difficulty || initialData.dificuldade || 'Fácil',
        image: initialData.image || initialData.imagem || '/boloCenoura.jpg',
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : initialData.tags || 'Sem Alérgenos',
        ingredients: parsedIngredients,
        instructions:
          initialData.instructions ||
          initialData.instrucoes ||
          initialData.modoPreparo ||
          '',
      })
    } else {
      setFormData({
        title: '',
        time: '20 min',
        difficulty: 'Fácil',
        image: '/boloCenoura.jpg',
        tags: 'Sem Alérgenos',
        ingredients: '',
        instructions: '',
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    const cleanTitle = formData.title.trim()
    if (!cleanTitle) {
      alert('Informe o título da receita.')
      return
    }

    const rawIngredientsList = formData.ingredients
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean)

    // Grava simultaneamente campos em português e inglês para compatibilidade total
    const payload = {
      title: cleanTitle,
      nome: cleanTitle,
      time: formData.time.trim() || '20 min',
      tempo: formData.time.trim() || '20 min',
      difficulty: formData.difficulty,
      dificuldade: formData.difficulty,
      image: formData.image,
      imagem: formData.image,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: rawIngredientsList,
      ingredientes: rawIngredientsList.map((item) => ({
        nome: item,
        alergenos: [],
      })),
      instructions: formData.instructions.trim(),
      instrucoes: formData.instructions.trim(),
    }

    const sucesso = addRecipe(payload)
    if (sucesso) {
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 1055,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        // Fecha o modal ao clicar fora da caixa
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 p-4 position-relative"
        style={{ maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-4 shadow-none"
          onClick={onClose}
        ></button>

        <h4 className="fw-bold mb-1" style={{ color: '#1b4332' }}>
          {initialData ? 'Clonar / Editar Receita' : 'Nova Receita'}
        </h4>
        <p className="text-secondary small mb-4">
          Preencha os dados da receita para disponibilizá-la na comunidade.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Título da Receita</label>
            <input
              type="text"
              required
              className="form-control rounded-3"
              placeholder="Ex: Torta Saudável de Frutas"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary">Tempo de Preparo</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Ex: 25 min"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary">Dificuldade</label>
              <select
                className="form-select rounded-3"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Imagem (da pasta public)</label>
            <select
              className="form-select rounded-3"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            >
              <option value="/boloCenoura.jpg">Bolo de Cenoura (/boloCenoura.jpg)</option>
              <option value="/bolo-de-milho.jpg">Bolo de Milho (/bolo-de-milho.jpg)</option>
              <option value="/brigadeiro.webp">Brigadeiro (/brigadeiro.webp)</option>
              <option value="/batatainglesa.jpg">Batata Inglesa (/batatainglesa.jpg)</option>
              <option value="/arrozbranco.png">Arroz Branco (/arrozbranco.png)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Tags (separadas por vírgula)</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Sem Glúten, Vegano, Rico em Fibras"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Ingredientes (1 por linha)</label>
            <textarea
              rows={3}
              className="form-control rounded-3"
              placeholder="2 bananas maduras&#10;1 xícara de aveia"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Modo de Preparo</label>
            <textarea
              rows={2}
              className="form-control rounded-3"
              placeholder="Descreva as instruções de preparo..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn text-white w-100 rounded-3 py-2 fw-semibold shadow-sm"
            style={{ backgroundColor: '#1b4332' }}
          >
            {initialData ? 'Salvar Cópia da Receita' : 'Publicar Receita'}
          </button>
        </form>
      </div>
    </div>
  )
}