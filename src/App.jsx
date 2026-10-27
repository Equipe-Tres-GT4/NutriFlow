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
