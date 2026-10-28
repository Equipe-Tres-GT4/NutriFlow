import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Catalogo from './components/Catalogo';
import Layout from './components/Layout';
import Home from './pages/Home';
import Receitas from './pages/Receitas';
import RotaProtegida from './auth/RotaProtegida';


export default function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
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
        <Route path="/receitas" element={<Receitas />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}







// import { Routes, Route } from 'react-router-dom'

// import Header from './components/Header'
// import Home from './pages/Home'
// import Login from './pages/Login'
// import Cadastro from './pages/Cadastro'
// import Catalogo from './components/Catalogo'

// export default function App() {
//   return (
//     <>
//       <Header />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/alimentos" element={<Catalogo />} />
//         <Route path="/receitas" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/cadastro" element={<Cadastro />} />
//       </Routes>
//     </>
//   )
// }
