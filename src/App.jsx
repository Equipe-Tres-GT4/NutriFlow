import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Catalogo from './components/Catalogo';
import Layout from './components/Layout';
import Home from './pages/Home';


export default function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      
    </Routes>

{/* Catálogo */}
      <Route path="/catalogo" element={<Catalogo />} />
        
         {/* Páginas protegidas */}
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
