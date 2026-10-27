import { useState } from 'react';
import { RecipeCard } from '../components/RecipeCard';
import { receitasMock } from '../data/receitasMock';

export default function Receitas() {
  const [receitas] = useState(receitasMock);

  return (
    <div className="container py-5">
      <header className="mb-5 text-center">
        <h1 className="fw-bold text-success display-5 mb-2">Receitas da comunidade</h1>
        <p className="text-secondary lead mx-auto" style={{ maxWidth: '650px' }}>
          Explore receitas deliciosas e saudáveis compartilhadas por nossa comunidade. 
          Encontre inspiração para a sua rotina alimentar de forma simples e acessível.
        </p>
      </header>

      {receitas.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3 border">
          <p className="fs-5 text-muted mb-0">Nenhuma receita disponível no momento.</p>
        </div>
      ) : (
        <div className="row g-4">
          {receitas.map((receita) => (
            <RecipeCard key={receita.id} receita={receita} />
          ))}
        </div>
      )}
    </div>
  );
}
