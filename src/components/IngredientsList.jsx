import React, { useState } from 'react';

export default function IngredientsList({ ingredientesBase }) {
  const [checados, setChecados] = useState({});

  const toggleCheck = (index) => {
    setChecados((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const listaIngredientes = Array.isArray(ingredientesBase) ? ingredientesBase : [];

  return (
    <div>
      <h3 className="fw-bold mb-4" style={{ color: '#1b4332', fontSize: '1.35rem', fontFamily: 'Georgia, serif' }}>
        Ingredientes
      </h3>

      <ul className="list-unstyled space-y-3 mb-0">
        {listaIngredientes.map((item, idx) => {
          const estaChecado = checados[idx];
          
          let textoIngrediente = '';

          if (typeof item === 'string') {
            textoIngrediente = item;
          } else {
            const qtd = item.qtdBase;
            const unidade = item.unidade || '';
            const nome = item.nome || '';

            // Se o qtdBase for 1 e o nome já começar com uma quantidade ou for "Sal a gosto", ignora o "1" da frente
            if (qtd === 1 && (nome.toLowerCase().startsWith('sal') || nome.toLowerCase().startsWith('cheiro') || nome.toLowerCase().startsWith('óleo') || nome.toLowerCase().startsWith('oleo') || nome.toLowerCase().startsWith('farinha') || nome.toLowerCase().startsWith('ovo'))) {
              textoIngrediente = `${unidade} ${nome}`.trim();
            } else if (qtd && qtd !== 1) {
              textoIngrediente = `${qtd} ${unidade} ${nome}`.trim();
            } else {
              textoIngrediente = `${unidade} ${nome}`.trim();
            }
          }

          return (
            <li key={idx} className="d-flex align-items-start gap-3 mb-3">
              <input
                type="checkbox"
                checked={!!estaChecado}
                onChange={() => toggleCheck(idx)}
                className="form-check-input mt-1 cursor-pointer shadow-none"
                style={{ accentColor: '#1b4332', width: '1.1rem', height: '1.1rem' }}
              />
              <span className={`small ${estaChecado ? 'text-muted text-decoration-line-through' : 'text-dark fw-medium'}`}>
                {textoIngrediente}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}