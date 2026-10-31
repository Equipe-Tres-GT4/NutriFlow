// src/App.jsx
import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useInRouterContext,
} from 'react-router-dom'
import { RecipeProvider, useRecipes } from './context/RecipeContext'
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

function RoteadorSeguro({ children }) {
  let dentroDoRouter = false
  try {
    dentroDoRouter = useInRouterContext()
  } catch (e) {
    dentroDoRouter = false
  }

  if (dentroDoRouter) {
    return <>{children}</>
  }
  return <BrowserRouter>{children}</BrowserRouter>
}

export default function App() {
  return (
    <RecipeProvider>
      <RoteadorSeguro>
        <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#FAF8F5' }}>
          <Navbar />

          <div className="flex-grow-1">
            <Routes>
              <Route path="/receitas/cadastrar" element={<CadastrarReceita />} />
              <Route path="/" element={<Home />} />
              <Route path="/alimentos" element={<Alimentos />} />
              <Route path="/receitas" element={<Receitas />} />
              {/* Rota dinâmica para aceitar o ID de qualquer receita clicada */}
              <Route path="/receita/:id" element={<DetalhesReceita />} />
              <Route path="/salvos" element={<Salvos />} />
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