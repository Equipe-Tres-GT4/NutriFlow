// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  useInRouterContext,
} from 'react-router-dom'
import { RecipeProvider } from './context/RecipeContext'
import { useAuth } from './auth/AuthContext'
import RotaProtegida from './auth/RotaProtegida'
import CadastrarReceita from './pages/CadastrarReceita'
import DetalhesReceita from './pages/DetalhesReceita'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Alimentos from './pages/Alimentos'
import Receitas from './pages/Receitas'
import Salvos from './pages/Salvos'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Visualizacao from './pages/Visualizacao'

function RoteadorSeguro({ children }) {
  const dentroDoRouter = useInRouterContext()
  if (dentroDoRouter) {
    return <>{children}</>
  }
  return <BrowserRouter>{children}</BrowserRouter>
}

export default function App() {
  const { usuario } = useAuth()

  return (
    <RecipeProvider>
      <RoteadorSeguro>
        <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#FAF8F5' }}>
          <Navbar />

          <div className="flex-grow-1">
            <Routes>
              <Route path="/receitas/cadastrar" element={<RotaProtegida><CadastrarReceita /></RotaProtegida>} />
              <Route path="/" element={usuario ? <Home /> : <Visualizacao />} />
              <Route path="/alimentos" element={<RotaProtegida><Alimentos /></RotaProtegida>} />
              <Route path="/receitas" element={<RotaProtegida><Receitas /></RotaProtegida>} />
              <Route path="/receitas/:id" element={<RotaProtegida><DetalhesReceita /></RotaProtegida>} />
              <Route path="/receita/:id" element={<RotaProtegida><DetalhesReceita /></RotaProtegida>} />
              <Route path="/salvos" element={<RotaProtegida><Salvos /></RotaProtegida>} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </RoteadorSeguro>
    </RecipeProvider>
  )
}