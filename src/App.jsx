import React from 'react';
import { BotaoCurtir } from './components/ui/BotaoCurtir';
import { BotaoFavorito } from './components/ui/BotaoFavorito';
import { AreaComentarios } from './components/ui/AreaComentarios';

function App() {
  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <h3 className="fw-bold text-success mb-4">Painel de Interações - NutriFlow</h3>
      
      {/* Botões de Ação */}
      <div className="d-flex gap-3 mb-4">
        <BotaoCurtir curtidasIniciais={8} usuarioAutenticado={true} />
        <BotaoFavorito usuarioAutenticado={true} receitaId={1} />
      </div>

      {/* Área de Comentários */}
      <AreaComentarios usuarioAutenticado={true} nomeUsuario="Kauan" />
    </div>
  );
}

export default App;