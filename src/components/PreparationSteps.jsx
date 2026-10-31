import React, { useState } from 'react';

export default function PreparationSteps({ passos }) {
  const [concluidos, setConcluidos] = useState({});

  const togglePasso = (index) => {
    setConcluidos((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-[#1C3B2B] mb-4">Modo de Preparo</h2>
      <ol className="space-y-4">
        {passos.map((passo, idx) => (
          <li key={idx} className="flex items-start justify-between gap-4">
            <span className="text-gray-800 leading-relaxed">
              <strong>{idx + 1}.</strong> {passo}
            </span>
            <input
              type="checkbox"
              checked={!!concluidos[idx]}
              onChange={() => togglePasso(idx)}
              className="w-4 h-4 mt-1 accent-[#1C3B2B] rounded cursor-pointer flex-shrink-0"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}