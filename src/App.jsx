
// import { Routes, Route } from 'react-router-dom';

// import Login from './pages/Login';
// import Cadastro from './pages/Cadastro';
// import Home from './pages/Home';
// import Layout from './components/Layout';
// import RotaProtegida from './auth/RotaProtegida';
// import Catalogo from './components/Catalogo';

// export default function App() {
//   return (
//     <Routes>
//       {/* Páginas públicas */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/cadastro" element={<Cadastro />} />

//       {/* Catálogo para testar busca e filtros */}
//       <Route path="/catalogo" element={<Catalogo />} />

//       {/* Páginas protegidas que usam o Header do Layout */}
//       <Route
//         element={
//           <RotaProtegida>
//             <Layout />
//           </RotaProtegida>
//         }
//       >
//         {/* <Route path="/" element={<Home />} /> */}
//       </Route>
//     </Routes>
//   );
// }




import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Catalogo from './components/Catalogo';
import Login from './pages/Login';

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={<h1>Início</h1>}
        />

        <Route
          path="/receitas"
          element={<h1>Receitas</h1>}
        />

        <Route
          path="/alimentos"
          element={<Catalogo />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<h1>Cadastrar</h1>}
        />
      </Routes>
    </>
  );
}

export default App;