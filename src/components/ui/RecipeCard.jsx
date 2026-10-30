import React from 'react';
import { BotaoCurtir } from './ui/BotaoCurtir';
import { BotaoFavorito } from './ui/BotaoFavorito';

export function RecipeCard({ receita }) {
  const { id, titulo, autor, tempoPreparo, dificuldade, imagem, etiquetas } = receita;

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm border-0">
        {imagem ? (
          <img
            src={imagem}
            className="card-img-top"
            alt={titulo}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="bg-light d-flex align-items-center justify-content-center text-muted"
            style={{ height: '200px' }}
          >
            <span>Sem imagem disponível</span>
          </div>
        )}

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-success fw-bold">{titulo}</h5>
          <p className="card-subtitle text-muted mb-2 small">Por {autor}</p>

          <div className="d-flex justify-content-between align-items-center mb-2 small text-secondary">
            <span>⏱️ {tempoPreparo}</span>
            {dificuldade && (
              <span className="badge bg-light text-dark border">
                {dificuldade}
              </span>
            )}
          </div>

          {etiquetas && etiquetas.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-1 mb-1">
                {etiquetas.map((tag, index) => (
                  <span
                    key={index}
                    className="badge bg-success-subtle text-success border border-success-subtle"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                *Etiquetas autodeclaradas pelo autor
              </small>
            </div>
          )}

          <div className="mt-auto">
            <a href={`/receitas/${id}`} className="btn btn-outline-success w-100 fw-semibold">
              Ver receita
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { BotaoCurtir } from './ui/BotaoCurtir';
import { BotaoFavorito } from './ui/BotaoFavorito';

export function RecipeCard({ receita }) {
  const { id, titulo, autor, tempoPreparo, dificuldade, imagem, etiquetas, curtidas } = receita;

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm border-0">
        {imagem ? (
          <img
            src={imagem}
            className="card-img-top"
            alt={titulo}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="bg-light d-flex align-items-center justify-content-center text-muted"
            style={{ height: '200px' }}
          >
            <span>Sem imagem disponível</span>
          </div>
        )}

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-success fw-bold">{titulo}</h5>
          <p className="card-subtitle text-muted mb-2 small">Por {autor}</p>

          <div className="d-flex justify-content-between align-items-center mb-2 small text-secondary">
            <span>⏱️ {tempoPreparo}</span>
            {dificuldade && (
              <span className="badge bg-light text-dark border">
                {dificuldade}
              </span>
            )}
          </div>

          {etiquetas && etiquetas.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-1 mb-1">
                {etiquetas.map((tag, index) => (
                  <span
                    key={index}
                    className="badge bg-success-subtle text-success border border-success-subtle"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                *Etiquetas autodeclaradas pelo autor
              </small>
            </div>
          )}

          <div className="mt-auto">
            <a href={`/receitas/${id}`} className="btn btn-outline-success w-100 fw-semibold mb-3">
              Ver receita
            </a>

            {/* Botões de Interação integrados no card */}
            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <BotaoCurtir curtidasIniciais={curtidas || 0} usuarioAutenticado={true} />
              <BotaoFavorito usuarioAutenticado={true} receitaId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}