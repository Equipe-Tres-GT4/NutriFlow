import React, { useState } from 'react';

export default function IngredientsList({ porcoesIniciais = 2, ingredientesBase }) {
  const [porcoes, setPorcoes] = useState(porcoesIniciais);
  const [checados, setChecados] = useState({});

  const alterarPorcoes = (delta) => {
    setPorcoes((prev) => Math.max(1, prev + delta));
  };

  const toggleCheck = (index) => {
    setChecados((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-[#F5F3EB] p-6 rounded-2xl">
      <h2 className="text-xl font-bold text-[#1C3B2B] mb-4">Ingredientes</h2>
      
      {/* Controles de Porção */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center bg-[#1C3B2B] text-white rounded-xl px-3 py-1.5 gap-3">
          <button 
            onClick={() => alterarPorcoes(-1)}
            className="text-lg font-bold hover:opacity-80 px-1"
          >
            -
          </button>
          <span className="font-semibold">{porcoes} porções</span>
          <button 
            onClick={() => alterarPorcoes(1)}
            className="text-lg font-bold hover:opacity-80 px-1"
          >
            +
          </button>
        </div>
      </div>

      {/* Lista de Ingredientes com Multiplicador */}
      <ul className="space-y-3">
        {ingredientesBase.map((item, idx) => {
          const quantidadeCalculada = (item.qtdBase / porcoesIniciais) * porcoes;
          const estaChecado = checados[idx];

          return (
            <li key={idx} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!estaChecado}
                onChange={() => toggleCheck(idx)}
                className="w-4 h-4 accent-[#1C3B2B] rounded cursor-pointer"
              />
              <span className={estaChecado ? "line-through text-gray-400" : "text-gray-800"}>
                {quantidadeCalculada} {item.unidade} {item.nome}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}