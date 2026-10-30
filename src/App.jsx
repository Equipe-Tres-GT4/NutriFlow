import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Catalogo from './components/Catalogo'
import Receitas from './pages/Receitas'
import Perfil from './pages/Perfil'
import Salvos from './pages/Salvos'

export default function App() {
  const { usuario } = useAuth()

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header isAuthenticated={Boolean(usuario)} />

      <div className="flex-grow-1">
        <Routes>
          {/* Consultas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/alimentos" element={<Catalogo />} />
          <Route path="/receitas" element={<Receitas />} />

          {/* Compatibilidade de rotas */}
          <Route path="/catalogo" element={<Navigate to="/alimentos" replace />} />
          <Route path="/pesquisa" element={<Navigate to="/alimentos" replace />} />

          {/* Autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Áreas do Usuário Autenticado */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/salvos" element={<Salvos />} />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}