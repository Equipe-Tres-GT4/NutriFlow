
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useInRouterContext,
} from 'react-router-dom'

import { useAuth } from './auth/useAuth'
import RotaProtegida from './auth/RotaProtegida'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Comunidade from './pages/Comunidade'
import Receitas from './pages/Receitas'
import Salvos from './pages/Salvos'
import DetalhesReceita from './pages/DetalhesReceita'
import CadastrarReceita from './pages/CadastrarReceita'
import Perfil from './pages/Perfil'
import Participante from './pages/Participante'
import Conexoes from './pages/Conexoes'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Mensagens from './pages/Mensagens'
import AdminDenuncias from './pages/AdminDenuncias'
import MinhasDenuncias from './pages/MinhasDenuncias'

function RoteadorSeguro({ children }) {
  const dentroDoRouter = useInRouterContext()

  if (dentroDoRouter) {
    return <>{children}</>
  }

  return <BrowserRouter>{children}</BrowserRouter>
}

export default function App() {
  const { carregando, usuario } = useAuth()

  if (carregando) {
    return (
      <div
        className="container py-5 text-center"
        role="status"
      >
        Carregando NutriFlow...
      </div>
    )
  }

  return (
    <RoteadorSeguro>
      <div
        className="d-flex flex-column min-vh-100"
        style={{ backgroundColor: '#faf8f5' }}
      >
        <Navbar />

        <div className="flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/comunidade" replace />}
            />

            <Route
              path="/comunidade"
              element={<Comunidade />}
            />

            <Route
              path="/alimentos"
              element={<Navigate to="/receitas" replace />}
            />

            <Route
              path="/receitas"
              element={<Receitas />}
            />

            <Route
              path="/receitas/cadastrar"
              element={
                <RotaProtegida>
                  <CadastrarReceita />
                </RotaProtegida>
              }
            />

            <Route
              path="/receitas/:id"
              element={<DetalhesReceita />}
            />

            <Route
              path="/receita/:id"
              element={<Navigate to="/receitas" replace />}
            />

            <Route
              path="/salvos"
              element={
                <RotaProtegida>
                  <Salvos />
                </RotaProtegida>
              }
            />

            <Route
              path="/conexoes"
              element={
                <RotaProtegida>
                  <Conexoes />
                </RotaProtegida>
              }
            />

            <Route
              path="/mensagens"
              element={
                <RotaProtegida>
                  <Mensagens />
                </RotaProtegida>
              }
            />

            <Route
              path="/minhas-denuncias"
              element={
                <RotaProtegida>
                  <MinhasDenuncias />
                </RotaProtegida>
              }
            />

            <Route
              path="/admin/denuncias"
              element={
                <RotaProtegida>
                  {usuario?.papel === 'admin' ? (
                    <AdminDenuncias />
                  ) : (
                    <Navigate to="/comunidade" replace />
                  )}
                </RotaProtegida>
              }
            />

            <Route
              path="/perfil"
              element={
                <RotaProtegida>
                  <Perfil />
                </RotaProtegida>
              }
            />

            <Route
              path="/participantes/:id"
              element={<Participante />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/cadastro"
              element={<Cadastro />}
            />

            <Route
              path="/integracoes"
              element={<Navigate to="/receitas" replace />}
            />

            <Route
              path="/aulas"
              element={<Navigate to="/comunidade" replace />}
            />

            <Route
              path="*"
              element={
                <main className="container py-5">
                  <h1>Página não encontrada</h1>
                  <p>
                    Volte à <a href="/comunidade">Comunidade</a>.
                  </p>
                </main>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </RoteadorSeguro>
  )
}
