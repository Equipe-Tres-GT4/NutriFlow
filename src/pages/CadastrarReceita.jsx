// src/pages/CadastrarReceita.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useRecipes } from '../context/RecipeContext'

export default function CadastrarReceita() {
  const { addRecipe } = useRecipes()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [tempo, setTempo] = useState('20 min')
  const [dificuldade, setDificuldade] = useState('Fácil')
  const [imagem, setImagem] = useState('/boloCenoura.jpg')
  const [previewImagem, setPreviewImagem] = useState('')
  const [ingredientes, setIngredientes] = useState('')
  const [preparo, setPreparo] = useState('')
  const [tags, setTags] = useState('Sem Alérgenos')

  // Função para lidar com o upload do ficheiro do computador
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagem(reader.result) // Guarda a string em Base64
        setPreviewImagem(reader.result) // Exibe a pré-visualização
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!nome.trim()) {
      alert('Por favor, informe o título da receita.')
      return
    }

    const novaReceita = {
      id: Date.now().toString(),
      nome,
      title: nome,
      tempo,
      dificuldade,
      imagem: imagem.trim() || '/boloCenoura.jpg',
      ingredientes: ingredientes.split('\n').filter(Boolean),
      preparo,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      author: 'Comunidade',
      nota: 5.0,
      ratingCount: 1,
    }

    addRecipe(novaReceita)
    navigate('/receitas')
  }

  return (
    <main className="container py-5" style={{ maxWidth: '850px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Link to="/receitas" className="text-decoration-none text-secondary d-flex align-items-center gap-1 small fw-semibold">
          <i className="bi bi-arrow-left"></i> Voltar para Receitas
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <div className="mb-4 text-center">
          <h2 className="fw-bold mb-1" style={{ color: '#1b4332' }}>
            <i className="bi bi-journal-plus me-2"></i>Nova Receita
          </h2>
          <p className="text-secondary small">
            Preencha os dados abaixo e carregue uma imagem para disponibilizar a sua receita à comunidade NutriFlow.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Título da Receita</label>
            <input
              type="text"
              className="form-control rounded-3 py-2"
              placeholder="Ex: Torta Saudável de Frutas"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark">Tempo de Preparo</label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="Ex: 20 min"
                value={tempo}
                onChange={(e) => setTempo(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark">Dificuldade</label>
              <select
                className="form-select rounded-3 py-2"
                value={dificuldade}
                onChange={(e) => setDificuldade(e.target.value)}
              >
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          {/* SECÇÃO DE UPLOAD DE IMAGEM */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Imagem da Receita</label>
            <div className="input-group mb-2">
              <input
                type="file"
                accept="image/*"
                className="form-control rounded-3 py-2"
                onChange={handleImageUpload}
              />
            </div>
            <small className="text-muted d-block mb-2">Ou insira um link/caminho alternativo abaixo:</small>
            <input
              type="text"
              className="form-control rounded-3 py-2"
              placeholder="/boloCenoura.jpg ou URL"
              value={previewImagem ? 'Imagem carregada do computador' : imagem}
              onChange={(e) => {
                setImagem(e.target.value)
                setPreviewImagem('')
              }}
            />

            {/* PRÉ-VISUALIZAÇÃO DA IMAGEM */}
            {(previewImagem || imagem) && (
              <div className="mt-3 text-center">
                <p className="small text-secondary mb-1">Pré-visualização:</p>
                <img
                  src={previewImagem || imagem}
                  alt="Pré-visualização"
                  className="rounded-3 shadow-sm border"
                  style={{ width: '140px', height: '100px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'
                  }}
                />
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Tags (separadas por vírgula)</label>
            <input
              type="text"
              className="form-control rounded-3 py-2"
              placeholder="Ex: Sem Alérgenos, Vegano, Fit"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">Ingredientes (1 por linha)</label>
            <textarea
              className="form-control rounded-3"
              rows={4}
              placeholder="Ex:&#10;2 bananas maduras&#10;1 xícara de aveia"
              value={ingredientes}
              onChange={(e) => setIngredientes(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-dark">Modo de Preparo</label>
            <textarea
              className="form-control rounded-3"
              rows={4}
              placeholder="Descreva o passo a passo das instruções de preparo..."
              value={preparo}
              onChange={(e) => setPreparo(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn text-white w-100 py-3 rounded-3 fw-bold shadow-sm"
            style={{ backgroundColor: '#1b4332' }}
          >
            Publicar Receita na Comunidade
          </button>
        </form>
      </div>
    </main>
  )
}