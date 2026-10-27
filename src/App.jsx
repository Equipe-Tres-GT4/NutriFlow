
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Layout from './components/Layout';
import RotaProtegida from './auth/RotaProtegida';
import Catalogo from './components/Catalogo';

export default function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Catálogo para testar busca e filtros */}
      <Route path="/catalogo" element={<Catalogo />} />

      {/* Páginas protegidas que usam o Header do Layout */}
      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}
