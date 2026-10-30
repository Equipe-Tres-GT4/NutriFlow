import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Salvos() {
  const { usuario, estaAutenticado, alternarSalvarReceita } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login')
    }
  }, [estaAutenticado, navigate])

  const salvas = usuario?.receitasSalvas || []

  return (
    <div className="container py-5 min-vh-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-bookmark-heart text-danger me-2"></i> Receitas Salvas
          </h3>
          <p className="text-muted small mb-0">Todas as receitas que você guardou para fazer depois.</p>
        </div>
        <Link to="/receitas" className="btn btn-outline-success btn-sm rounded-pill">
          Explorar Mais
        </Link>
      </div>

      {salvas.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 text-center py-5 p-4 bg-white">
          <i className="bi bi-bookmark display-3 text-muted opacity-50 mb-3"></i>
          <h5 className="text-secondary fw-semibold">Você ainda não salvou nenhuma receita</h5>
          <p className="text-muted small mb-4">
            Explore as receitas disponíveis no site e clique no ícone de coração para guardá-las aqui.
          </p>
          <Link to="/receitas" className="btn btn-success rounded-pill px-4 align-self-center">
            Ver Receitas
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {salvas.map((rec) => (
            <div key={rec.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="position-relative" style={{ height: 180, backgroundColor: '#f0f0f0' }}>
                  <img
                    src={rec.imagem || '/arrozbranco.png'}
                    alt={rec.titulo}
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=80'
                    }}
                  />
                  <button
                    onClick={() => alternarSalvarReceita(rec)}
                    className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm text-danger"
                    title="Remover dos salvos"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="card-title fw-bold text-dark mb-2">{rec.titulo}</h5>
                  <div className="d-flex gap-3 text-muted small mb-3">
                    {rec.tempo && <span><i className="bi bi-clock me-1 text-success"></i>{rec.tempo}</span>}
                    {rec.calorias && <span><i className="bi bi-fire me-1 text-danger"></i>{rec.calorias} kcal</span>}
                  </div>

                  <button
                    onClick={() => alternarSalvarReceita(rec)}
                    className="btn btn-outline-danger btn-sm rounded-pill mt-auto w-100"
                  >
                    <i className="bi bi-bookmark-x me-1"></i> Remover dos Salvos
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}