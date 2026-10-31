import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Perfil() {
  const { usuario, estaAutenticado, atualizarPerfil } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login')
    }
  }, [estaAutenticado, navigate])

  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    telefone: usuario?.telefone || '',
    peso: usuario?.peso || '',
    altura: usuario?.altura || '',
    objetivo: usuario?.objetivo || 'Saúde e Longevidade',
    restricoes: usuario?.restricoes || ''
  })

  const [sucesso, setSucesso] = useState(false)

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function salvar(e) {
    e.preventDefault()
    atualizarPerfil(form)
    setSucesso(true)
    setTimeout(() => setSucesso(false), 3000)
  }

  if (!usuario) return null

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
        <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
          <div
            className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center fw-bold fs-3"
            style={{ width: 64, height: 64 }}
          >
            {usuario.nome ? usuario.nome[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="fw-bold text-dark mb-0">{usuario.nome}</h4>
            <span className="text-muted small">{usuario.email}</span>
          </div>
        </div>

        {sucesso && (
          <div className="alert alert-success py-2 small rounded-pill text-center mb-4" role="status">
            <i className="bi bi-check-circle me-1"></i> Dados complementares atualizados com sucesso!
          </div>
        )}

        <form onSubmit={salvar}>
          <h6 className="fw-bold text-success mb-3">Informações Pessoais</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Nome Completo</label>
              <input
                name="nome"
                className="form-control"
                value={form.nome}
                onChange={mudar}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">WhatsApp / Telefone</label>
              <input
                name="telefone"
                placeholder="(00) 00000-0000"
                className="form-control"
                value={form.telefone}
                onChange={mudar}
              />
            </div>
          </div>

          <h6 className="fw-bold text-success mb-3">Dados Físicos e Nutricionais</h6>
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                name="peso"
                placeholder="Ex: 70.5"
                className="form-control"
                value={form.peso}
                onChange={mudar}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Altura (cm)</label>
              <input
                type="number"
                name="altura"
                placeholder="Ex: 175"
                className="form-control"
                value={form.altura}
                onChange={mudar}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Objetivo Nutricional</label>
              <select name="objetivo" className="form-select" value={form.objetivo} onChange={mudar}>
                <option value="Perda de Peso">Perda de Peso</option>
                <option value="Ganho de Massa Muscular">Ganho de Massa Muscular</option>
                <option value="Manutenção de Peso">Manutenção de Peso</option>
                <option value="Saúde e Longevidade">Saúde e Longevidade</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Restrições ou Alergias Alimentares</label>
            <input
              name="restricoes"
              placeholder="Ex: Intolerância à lactose, glúten, vegetariano..."
              className="form-control"
              value={form.restricoes}
              onChange={mudar}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}