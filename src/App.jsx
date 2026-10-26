// import { Routes, Route } from 'react-router-dom'
// import Login from './pages/Login'
// import Cadastro from './pages/Cadastro'
// import Home from './pages/Home'
// import Layout from './components/Layout'
// import RotaProtegida from './auth/RotaProtegida'

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/cadastro" element={<Cadastro />} />

//       <Route element={<RotaProtegida><Layout /></RotaProtegida>}>
//         <Route path="/" element={<Home />} />
//       </Route>
//     </Routes>
//   )
// }




import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<h1>Início</h1>} />
        <Route path="/receitas" element={<h1>Receitas</h1>} />
        <Route path="/entrar" element={<h1>Entrar</h1>} />
        <Route path="/cadastrar" element={<h1>Cadastrar</h1>} />
      </Routes>
    </>
  );
}

export default App;
