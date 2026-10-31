import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import NutritionCard from '../components/NutritionCard';
import IngredientsList from '../components/IngredientsList';
import PreparationSteps from '../components/PreparationSteps';

export default function DetalhesReceita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, savedRecipeIds, toggleSaveRecipe } = useRecipes();

  // Procura a receita na lista global com base no ID da URL
  const receitaEncontrada = recipes.find(
    (r) => String(r.id || r.title || r.nome) === String(id)
  );

  // Fallback elegante caso a receita não seja encontrada diretamente
  const receita = receitaEncontrada || {
    nome: "Panqueca de Banana",
    title: "Panqueca de Banana",
    autor: "Comunidade",
    tempo: "20 min",
    nota: "4.8",
    ratingCount: 1,
    tags: ["Sem alérgenos", "Fácil"],
    imagem: "/boloCenoura.jpg",
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

  const receitaId = String(receita.id || receita.title || receita.nome);
  const titulo = receita.nome || receita.title;
  const autor = receita.author || receita.autor || "Comunidade";
  const tempo = receita.tempo || receita.time || "20 min";
  const nota = Number(receita.nota || receita.rating || 4.8).toFixed(1);
  const avaliacaoTexto = `${nota} (${receita.ratingCount || 1} avaliação)`;
  const imagem = receita.imagem || receita.image || "/boloCenoura.jpg";
  const tags = receita.tags || ["Sem alérgenos", "Fácil"];
  const porcoesBase = receita.porcoesBase || 2;
  const isSaved = savedRecipeIds ? savedRecipeIds.includes(receitaId) : false;

  const ingredientesFormatados = Array.isArray(receita.ingredientes)
    ? receita.ingredientes.map(item => typeof item === 'string' ? { qtdBase: 1, unidade: "", nome: item } : item)
    : [{ qtdBase: 1, unidade: "", nome: receita.ingredientes || "Ingredientes não especificados" }];

  const passosFormatados = Array.isArray(receita.preparo) 
    ? receita.preparo 
    : (receita.passos || [receita.preparo || "Modo de preparo não informado."]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link da receita copiado para a área de transferência!');
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', color: '#2C3E35' }} className="py-5">
      <div className="container" style={{ maxWidth: '1140px' }}>
        
        {/* BARRA SUPERIOR: Botão Voltar e Ações */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <button 
            onClick={() => navigate('/receitas')}
            className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2 border-0 transition-all"
            style={{ backgroundColor: '#1b4332', fontSize: '0.9rem' }}
          >
            <i className="bi bi-arrow-left"></i> Voltar para receitas
          </button>

          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={() => toggleSaveRecipe(receitaId)}
              className="btn bg-white border px-4 py-2 rounded-pill fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-2 transition-all"
              style={{ borderColor: '#E5E7EB', fontSize: '0.9rem' }}
            >
              {isSaved ? <i className="bi bi-heart-fill text-danger"></i> : <i className="bi bi-heart"></i>} 
              <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="btn bg-white border px-4 py-2 rounded-pill fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-2 transition-all"
              style={{ borderColor: '#E5E7EB', fontSize: '0.9rem' }}
            >
              <i className="bi bi-share"></i> Compartilhar
            </button>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="row g-5 align-items-start">
          
          {/* COLUNA ESQUERDA (Destaque Visual, Título e Nutrição) */}
          <div className="col-12 col-lg-7">
            <h1 className="fw-bold mb-2" style={{ color: '#1b4332', fontFamily: 'Georgia, serif', fontSize: '2.4rem', letterSpacing: '-0.02em' }}>
              {titulo}
            </h1>
            <p className="text-muted small mb-3 fw-medium">
              Por {autor} &bull; <i className="bi bi-clock me-1"></i>{tempo} &bull; <i className="bi bi-star-fill text-warning me-1"></i>{avaliacaoTexto}
            </p>
            
            <div className="d-flex gap-2 mb-4 flex-wrap">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="badge rounded-pill px-3 py-2 fw-semibold"
                  style={{ backgroundColor: '#E2ECE9', color: '#1b4332', fontSize: '0.78rem' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Imagem Principal com cantos sofisticados e sombra difusa */}
            <div className="mb-5 overflow-hidden rounded-4 shadow-sm border border-light">
              <img 
                src={imagem} 
                alt={titulo} 
                className="w-100"
                style={{ height: '400px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60';
                }}
              />
            </div>

            {/* Secção de Informação Nutricional refinada */}
            <div className="mb-4">
              <h3 className="fw-bold mb-3" style={{ color: '#1b4332', fontSize: '1.35rem', fontFamily: 'Georgia, serif' }}>
                Informação Nutricional
              </h3>
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <NutritionCard valor="280" unidade="kcal" label="Calorias" textoExplicativo="por porção" corFundo="#F7F5F0" />
                </div>
                <div className="col-6 col-md-3">
                  <NutritionCard valor="45" unidade="g" label="Carboidratos" textoExplicativo="completos" corFundo="#F0F4F8" />
                </div>
                <div className="col-6 col-md-3">
                  <NutritionCard valor="8" unidade="g" label="Proteínas" textoExplicativo="biodisponíveis" corFundo="#EFF6F1" />
                </div>
                <div className="col-6 col-md-3">
                  <NutritionCard valor="6" unidade="g" label="Gorduras" textoExplicativo="saudáveis" corFundo="#FAF0EC" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA (Bloco Integrado de Ingredientes e Modo de Preparo) */}
          <div className="col-12 col-lg-5">
            <div className="p-4 p-md-4 rounded-4 shadow-sm border border-opacity-50" style={{ backgroundColor: '#F4F1EA', borderColor: '#E4DFD5' }}>
              <IngredientsList porcoesIniciais={porcoesBase} ingredientesBase={ingredientesFormatados} />
              
              <hr className="my-4" style={{ borderColor: '#D8D2C5', opacity: 0.6 }} />
              
              <PreparationSteps passos={passosFormatados} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}