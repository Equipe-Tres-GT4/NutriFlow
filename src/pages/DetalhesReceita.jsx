import React from 'react';
import NutritionCard from '../components/NutritionCard';
import IngredientsList from '../components/IngredientsList';
import PreparationSteps from '../components/PreparationSteps';

export default function DetalhesReceita() {
  const receita = {
    titulo: "Panqueca de Banana",
    autor: "Comunidade",
    tempo: "20 min",
    avaliacao: "4.8 (1 avaliação)",
    tags: ["Sem alérgenos", "Fácil"],
    imagem: "https://via.placeholder.com/600x400", // Substituir pela imagem real
    porcoesBase: 2,
    ingredientes: [
      { qtdBase: 3, unidade: "", nome: "bananas maduras" },
      { qtdBase: 2, unidade: "", nome: "ovos" },
      { qtdBase: 1, unidade: "xícara de", nome: "aveia em flocos" },
      { qtdBase: 1, unidade: "pitada de", nome: "Canela a gosto" },
    ],
    passos: [
      "Em um prato, amasse bem as bananas com um garfo até obter um purê.",
      "Adicione os ovos e a aveia, misturando bem até obter uma massa homogênea.",
      "Aqueça uma frigideira antiaderente e coloque porções da massa.",
      "Cozinhe em fogo médio até dourar os dois lados."
    ]
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-8 px-4 md:px-12">
      {/* Botões do Topo */}
      <div className="flex justify-between items-center mb-6">
        <button className="bg-[#1C3B2B] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          ← Voltar para receitas
        </button>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1.5 hover:bg-gray-50">
            ♡ Salvar
          </button>
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1.5 hover:bg-gray-50">
            ⎘ Compartilhar
          </button>
        </div>
      </div>

      {/* Grid Principal: Esquerda (7 colunas em desktop) / Direita (5 colunas em desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Coluna Esquerda */}
        <div className="md:col-span-7">
          <h1 className="text-3xl font-serif font-bold text-[#1C3B2B] mb-2">{receita.titulo}</h1>
          <p className="text-sm text-gray-600 mb-3">
            Por {receita.autor} • 🕒 {receita.tempo} • ★ {receita.avaliacao}
          </p>
          
          <div className="flex gap-2 mb-4">
            {receita.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#DCEBE1] text-[#1C3B2B] text-xs px-3 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>

          <img 
            src={receita.imagem} 
            alt={receita.titulo} 
            className="w-full h-80 object-cover rounded-3xl mb-8"
          />

          {/* Informações Nutricionais */}
          <h2 className="text-xl font-bold text-[#1C3B2B] mb-4">Informação Nutricional</h2>
          <div className="flex gap-3 flex-wrap">
            <NutritionCard valor="280" unidade="kcal" label="Calorias" textoExplicativo="por porção" corFundo="#F5F3EB" />
            <NutritionCard valor="45" unidade="g" label="Carboidratos" textoExplicativo="completos" corFundo="#E8EEF5" />
            <NutritionCard valor="8" unidade="g" label="Proteínas" textoExplicativo="biodisponíveis" corFundo="#E8F4EC" />
            <NutritionCard valor="6" unidade="g" label="Gorduras" textoExplicativo="saudáveis" corFundo="#FCEEE8" />
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="md:col-span-5 bg-[#F5F3EB] p-6 rounded-3xl self-start">
          <IngredientsList porcoesIniciais={receita.porcoesBase} ingredientesBase={receita.ingredientes} />
          <hr className="my-6 border-gray-300" />
          <PreparationSteps passos={receita.passos} />
        </div>

      </div>
    </div>
  );
}