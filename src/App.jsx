import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Home from './pages/Home'
import Layout from './components/Layout'
import RotaProtegida from './auth/RotaProtegida'
import Catalogo from './components/Catalogo'
import { ComunidadeProvider } from './context/ComunidadeContext'
import ListaReceitas from './pages/ListaReceitas'
import ReceitaDetalhe from './pages/ReceitaDetalhe'
import PublicarReceita from './pages/PublicarReceita'
import Perfil from './pages/Perfil'
import Alimentos from './pages/Alimentos'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      {/* Catálogo público: visitantes podem pesquisar e ler informações. */}
      <Route path="/catalogo" element={<Catalogo />} />
      <Route element={<RotaProtegida><ComunidadeProvider><Layout /></ComunidadeProvider></RotaProtegida>}>
        <Route index element={<Home />} />
        <Route path="/alimentos" element={<Alimentos />} />
        <Route path="/pesquisa" element={<Navigate to="/alimentos" replace />} />
        <Route path="/receitas" element={<ListaReceitas />} />
        <Route path="/receitas/:id" element={<ReceitaDetalhe />} />
        <Route path="/salvos" element={<ListaReceitas apenasSalvos />} />
        <Route path="/minhas-receitas" element={<ListaReceitas apenasMinhas />} />
        <Route path="/publicar" element={<PublicarReceita />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
