import React, { useState } from 'react';

export function AreaComentarios({ usuarioAutenticado = false, nomeUsuario = "Visitante" }) {
  const [comentarios, setComentarios] = useState([
    { id: 1, autor: 'Ariely', texto: 'Receita incrível! Fiz no pequeno-almoço.', data: '28/10/2026' },
    { id: 2, autor: 'Vinícius', texto: 'Troquei o açúcar por mel e ficou ótimo.', data: '29/10/2026' }
  ]);

  const [novoTexto, setNovoTexto] = useState('');
  const [erro, setErro] = useState('');

  const handleEnviarComentario = (e) => {
    e.preventDefault();

    if (!usuarioAutenticado) {
      alert("Precisas de ter sessão iniciada para comentar!");
      return;
    }

    if (!novoTexto.trim()) {
      setErro('O comentário não pode estar vazio.');
      return;
    }

    const novoComentarioObj = {
      id: Date.now(),
      autor: nomeUsuario,
      texto: novoTexto,
      data: new Date().toLocaleDateString('pt-BR')
    };

    setComentarios([...comentarios, novoComentarioObj]);
    setNovoTexto('');
    setErro('');
  };

  return (
    <div className="card p-3 border-0 shadow-sm mt-4 bg-light">
      <h5 className="fw-bold text-success mb-3">Comentários ({comentarios.length})</h5>

      <div className="mb-4">
        {comentarios.length === 0 ? (
          <p className="text-muted small">Ainda não há comentários. Seja o primeiro a comentar!</p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="bg-white p-3 rounded mb-2 shadow-sm border-start border-4 border-success">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-dark">{c.autor}</strong>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>{c.data}</small>
              </div>
              <p className="mb-0 text-secondary" style={{ fontSize: '0.95rem' }}>{c.texto}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleEnviarComentario}>
        <div className="mb-2">
          <textarea
            className={`form-control ${erro ? 'is-invalid' : ''}`}
            rows="2"
            placeholder={
              usuarioAutenticado
                ? "Escreva o teu comentário..."
                : "Inicia sessão para comentar nesta receita..."
            }
            value={novoTexto}
            onChange={(e) => {
              setNovoTexto(e.target.value);
              if (erro) setErro('');
            }}
            disabled={!usuarioAutenticado}
          ></textarea>
          {erro && <div className="invalid-feedback">{erro}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-success btn-sm fw-semibold"
          disabled={!usuarioAutenticado}
        >
          Publicar Comentário
        </button>
      </form>
    </div>
  );
}