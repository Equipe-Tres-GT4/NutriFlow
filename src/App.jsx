<<<<<<< HEAD
//import { Routes, Route } from 'react-router-dom';

//import Login from './pages/Login';
//import Cadastro from './pages/Cadastro';
//import Home from './pages/Home';
//import Layout from './components/Layout';
//import RotaProtegida from './auth/RotaProtegida';
//import Catalogo from './components/Catalogo';
=======
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Catalogo from './components/Catalogo';
import Layout from './components/Layout';
import Home from './pages/Home';
import Receitas from './pages/Receitas';
import RotaProtegida from './auth/RotaProtegida';

>>>>>>> 642446ff7e865f9e6fecae4446a9958b9e91cced

export  function App() {
  return (
<<<<<<< HEAD
    <></>
    //<Routes>
     //{/* Páginas públicas */}
      //<Route path="/login" element={<Login />} />
      //<Route path="/cadastro" element={<Cadastro />} />

      //{/* Catálogo */}
      //<Route path="/catalogo" element={<Catalogo />} />

      //{/* Páginas protegidas */}
      //<Route
       // element={
        // <RotaProtegida>
          // <Layout />
          //</RotaProtegida>
        //}
      //>
      //<Route path="/" element={<Home />} />
    //</Route>
    //</Routes>
 )
}


export default App;
=======
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
>>>>>>> 642446ff7e865f9e6fecae4446a9958b9e91cced
