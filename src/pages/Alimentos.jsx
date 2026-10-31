// src/pages/Alimentos.jsx
import React, { useState } from 'react'
import { alimentos as ALIMENTOS_BASE } from '../data/alimentos' // <-- Alterado aqui (usando um alias)

export default function Alimentos() {
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')

  const categorias = ['Todas', 'Frutas', 'Legumes', 'Grãos', 'Proteínas', 'Laticínios']

  const filtrados = ALIMENTOS_BASE.filter((alimento) => {
    const atendeTexto = alimento.nome.toLowerCase().includes(busca.toLowerCase())
    const atendeCat = categoriaAtiva === 'Todas' || alimento.categoria === categoriaAtiva
    return atendeTexto && atendeCat
  })

  return (
    <main className="container py-5">
      <div className="text-center mx-auto mb-5" style={{ maxWidth: '680px' }}>
        <h1 className="fw-bold mb-2" style={{ color: '#1b4332' }}>
          Tabela Nutricional de Alimentos
        </h1>
        <p className="text-secondary small mb-4">
          Consulte informações nutricionais, macronutrientes e alérgenos de cada ingrediente.
        </p>

        <div className="input-group bg-white rounded-pill shadow-sm p-1 border mb-4">
          <span className="input-group-text bg-transparent border-0 ps-3">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none ps-2"
            placeholder="Buscar alimento ou ingrediente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaAtiva(cat)}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                categoriaAtiva === cat ? 'text-white' : 'btn-light border text-secondary'
              }`}
              style={categoriaAtiva === cat ? { backgroundColor: '#1b4332', borderColor: '#1b4332' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          Nenhum alimento encontrado com os filtros selecionados.
        </div>
      ) : (
        <div className="row g-4">
          {filtrados.map((alimento) => (
            <div className="col-12 col-md-6 col-lg-3" key={alimento.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <img
                  src={alimento.imagem}
                  alt={alimento.nome}
                  className="w-100"
                  style={{ height: 160, objectFit: 'cover' }}
                />
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill mb-2">
                      {alimento.categoria}
                    </span>
                    <h6 className="fw-bold text-dark mb-1">{alimento.nome}</h6>
                    <small className="text-muted d-block mb-3">Porção: {alimento.porcao}</small>

                    <div className="bg-light rounded-3 p-2 small mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Calorias:</span>
                        <span className="fw-bold text-dark">{alimento.calorias}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Carboidratos:</span>
                        <span className="fw-semibold text-dark">{alimento.carboidratos}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Proteínas:</span>
                        <span className="fw-semibold text-dark">{alimento.proteinas}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}