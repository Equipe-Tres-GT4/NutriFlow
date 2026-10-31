import React from 'react';

export default function NutritionCard({ valor, unidade, label, textoExplicativo, corFundo }) {
  return (
    <div 
      className="p-4 rounded-2xl text-center flex-1"
      style={{ backgroundColor: corFundo }}
    >
      <p className="text-2xl font-bold text-gray-900">
        {valor}<span className="text-lg font-semibold">{unidade}</span>
      </p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{textoExplicativo}</p>
    </div>
  );
}