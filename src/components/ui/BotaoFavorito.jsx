import React, { useState } from 'react';

export function BotaoFavorito({ usuarioAutenticado = false, receitaId }) {
  const [favorito, setFavorito] = useState(false);

  const handleFavoritar = () => {
    // Regra: se o visitante não estiver logado, avisa
    if (!usuarioAutenticado) {
      alert("Precisas de ter sessão iniciada para guardar receitas nos favoritos!");
      return;
    }

    // Alterna o estado de favorito
    setFavorito(!favorito);
    
    if (!favorito) {
      console.log(`Receita ${receitaId} adicionada aos favoritos.`);
    } else {
      console.log(`Receita ${receitaId} removida dos favoritos.`);
    }
  };

  return (
    <button
      onClick={handleFavoritar}
      className={`btn d-flex align-items-center gap-2 ${
        favorito ? 'btn-warning text-dark fw-semibold' : 'btn-outline-warning text-dark'
      }`}
    >
      <span>{favorito ? '⭐' : '☆'}</span>
      <span>{favorito ? 'Salvo nos Favoritos' : 'Salvar Receita'}</span>
    </button>
  );
}