import React from 'react';
import { 
  Search, 
  User, 
  Heart, 
  Star, 
  ArrowRight, 
  WheatOff, 
  MilkOff, 
  Salad, 
  Sprout 
} from 'lucide-react';

export default function NutriFlowPage() {
  // Dados dos filtros dietéticos
  const dietFilters = [
    { label: 'Sem glúten', icon: WheatOff },
    { label: 'Sem lactose', icon: MilkOff },
    { label: 'Vegetariano', icon: Salad },
    { label: 'Vegano', icon: Sprout },
  ];

  // Dados das categorias
  const categories = [
    { name: 'Frutas', image: '' },
    { name: 'Legumes', image: '' },
    { name: 'Grãos', image: '' },
    { name: 'Proteínas', image: '' },
    { name: 'Laticínios', image: '' },
  ];

  // Dados das receitas em destaque
  const recipes = [
    {
      title: 'Salada de quinoa',
      time: '20 min',
      difficulty: 'Fácil',
      rating: '4.8',
      reviews: '124',
      image: '',
    },
    {
      title: 'Panqueca de banana',
      time: '20 min',
      difficulty: 'Fácil',
      rating: '4.7',
      reviews: '89',
      image: '',
    },
    {
      title: 'Smoothie de frutas',
      time: '20 min',
      difficulty: 'Fácil',
      rating: '4.6',
      reviews: '76',
      image: '',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-gray-800 font-sans pb-12">
      {/* NAVBAR */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#1b4332] fill-[#1b4332]" />
            <span className="text-xl font-bold tracking-tight text-[#1b4332]">NutriFlow</span>
          </div>

          {/* Links de Navegação */}
          <nav className="flex items-center gap-8 text-sm font-medium">
            <a href="#inicio" className="text-[#1b4332] border-b-2 border-[#1b4332] pb-1">Início</a>
            <a href="#pesquisa" className="text-gray-600 hover:text-[#1b4332] transition-colors">Pesquisa</a>
            <a href="#receitas" className="text-gray-600 hover:text-[#1b4332] transition-colors">Receitas</a>
          </nav>

          {/* Ícones do Topo */}
          <div className="flex items-center gap-4 text-gray-700">
            <button className="p-1 hover:text-[#1b4332] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-1 hover:text-[#1b4332] transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-8">
        <div className="bg-[#e8f0e6] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="max-w-md z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b4332] leading-tight mb-4">
              Comida boa é<br />vida que flui!
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              Descubra alimentos, receitas e informações para uma alimentação mais saudável e adequada às suas necessidades.
            </p>

            {/* Barra de Pesquisa */}
            <div className="bg-white rounded-full p-1.5 pl-4 flex items-center shadow-sm border border-gray-100 max-w-lg">
              <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Buscar alimentos, receitas ou ingredientes..."
                className="w-full text-xs md:text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <button className="bg-[#2d5a3f] hover:bg-[#1b4332] text-white p-2.5 rounded-full transition-colors shrink-0">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Imagem do Prato Hero */}
          <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src=""
              alt="Prato saudável em tigela"
              className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-full shadow-lg border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* FILTROS DIETÉTICOS */}
      <section className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dietFilters.map((filter, index) => {
            const Icon = filter.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#1b4332] text-white flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-700">{filter.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIAS EM DESTAQUE */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Categorias em destaque</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-2 pb-3 flex flex-col items-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-24 object-cover rounded-xl mb-3"
              />
              <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RECEITAS EM DESTAQUE */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Receitas em destaque</h2>
          <a href="#todas" className="text-xs font-semibold text-[#1b4332] hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Botão Favoritar */}
              <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>

              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-44 object-cover"
              />

              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">{recipe.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{recipe.time} • {recipe.difficulty}</p>

                <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{recipe.rating}</span>
                  <span className="text-gray-400">({recipe.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


