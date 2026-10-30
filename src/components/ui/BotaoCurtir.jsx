import React, { useState } from 'react';

export function BotaoCurtir({ curtidasIniciais = 0, usuarioAutenticado = false }) {
  const [curtido, setCurtido] = useState(false);
  const [totalCurtidas, setTotalCurtidas] = useState(curtidasIniciais);

  const handleCurtir = () => {
    if (!usuarioAutenticado) {
      alert("Precisas de ter sessão iniciada para curtir esta receita!");
      return;
    }

    if (curtido) {
      setCurtido(false);
      setTotalCurtidas(totalCurtidas - 1);
    } else {
      setCurtido(true);
      setTotalCurtidas(totalCurtidas + 1);
    }
  };

  return (
    <button
      onClick={handleCurtir}
      className={`btn d-flex align-items-center gap-2 ${
        curtido ? 'btn-danger text-white' : 'btn-outline-danger'
      }`}
    >
      <span>{curtido ? '❤️' : '🤍'}</span>
      <span className="fw-semibold">{totalCurtidas}</span>
    </button>
  );
}