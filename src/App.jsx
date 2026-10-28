import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Catalogo from './components/Catalogo'
import Receitas from './pages/Receitas'

export default function App() {
  const { usuario } = useAuth()

  return (
    <>
      <Header isAuthenticated={Boolean(usuario)} />

      <Routes>
        {/* Consultas públicas: não precisam de login. */}
        <Route path="/" element={<Home />} />
        <Route path="/alimentos" element={<Catalogo />} />
        <Route path="/receitas" element={<Receitas />} />

        {/* Compatibilidade com os endereços usados por outras telas. */}
        <Route path="/catalogo" element={<Navigate to="/alimentos" replace />} />
        <Route path="/pesquisa" element={<Navigate to="/alimentos" replace />} />

        {/* Autenticação. */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
