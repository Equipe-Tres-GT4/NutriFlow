import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useInRouterContext,
} from 'react-router-dom'
import { RecipeProvider, useRecipes } from './context/RecipeContext'
import { useAuth } from './auth/AuthContext'
import RotaProtegida from './auth/RotaProtegida'

import Home from './pages/Home'
import Receitas from './pages/Receitas'
import Salvos from './pages/Salvos'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Visualizacao from './pages/Visualizacao'

// Previne a exceção fatal de múltiplos <BrowserRouter> encadeados
function RoteadorSeguro({ children }) {
  const dentroDoRouter = useInRouterContext()

  if (dentroDoRouter) {
    return <>{children}</>
  }
  return <BrowserRouter>{children}</BrowserRouter>
}

function Navbar() {
  const { savedRecipeIds, currentUser } = useRecipes()
  const { usuario, sair } = useAuth()
  const totalSalvos = savedRecipeIds ? savedRecipeIds.length : 0
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const estaLogado = Boolean(usuario)

  return (
    <header className="bg-white border-bottom sticky-top py-2">
      <div className="container d-flex align-items-center justify-content-between">
        {/* LOGÓTIPO */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, backgroundColor: '#e8f0e6', color: '#1b4332' }}
          >
            <i className="bi bi-flower1 fs-5"></i>
          </div>
          <span className="fw-bold fs-4" style={{ color: '#1b4332', letterSpacing: '-0.5px' }}>
            NutriFlow
          </span>
        </Link>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="d-none d-md-flex align-items-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-decoration-none fw-semibold small ${
                isActive ? 'border-bottom border-2 pb-1' : 'text-secondary'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? '#1b4332' : '',
              borderColor: isActive ? '#1b4332' : 'transparent',
            })}
          >
            Início
          </NavLink>

          <NavLink
            to="/alimentos"
            className={({ isActive }) =>
              `text-decoration-none fw-semibold small ${
                isActive ? 'border-bottom border-2 pb-1' : 'text-secondary'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? '#1b4332' : '',
              borderColor: isActive ? '#1b4332' : 'transparent',
            })}
          >
            Alimentos
          </NavLink>

          <NavLink
            to="/receitas"
            className={({ isActive }) =>
              `text-decoration-none fw-semibold small ${
                isActive ? 'border-bottom border-2 pb-1' : 'text-secondary'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? '#1b4332' : '',
              borderColor: isActive ? '#1b4332' : 'transparent',
            })}
          >
            Receitas
          </NavLink>
        </nav>

        {/* AÇÕES À DIREITA */}
        <div className="d-flex align-items-center gap-3 position-relative">
          <Link
            to="/salvos"
            className="btn btn-light btn-sm rounded-circle position-relative p-2 text-secondary shadow-sm"
            title="Receitas Salvas"
          >
            <i className="bi bi-bookmark-heart fs-6"></i>
            {totalSalvos > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem' }}
              >
                {totalSalvos}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 text-secondary shadow-sm"
            onClick={() => {
              const inputBusca = document.querySelector('input[type="text"]')
              if (inputBusca) inputBusca.focus()
            }}
            title="Pesquisar"
          >
            <i className="bi bi-search fs-6"></i>
          </button>

          {/* PERFIL / LOGIN / LOGOUT MENU */}
          <div className="position-relative">
            <button
              type="button"
              className={`btn btn-sm rounded-circle p-2 shadow-sm ${
                estaLogado ? 'btn-success text-white' : 'btn-light text-secondary'
              }`}
              style={estaLogado ? { backgroundColor: '#1b4332', borderColor: '#1b4332' } : {}}
              onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
              title="Conta do Usuário"
            >
              <i className="bi bi-person fs-5"></i>
            </button>

            {menuPerfilAberto && (
              <div
                className="card border-0 shadow-lg rounded-4 position-absolute end-0 mt-2 p-3"
                style={{ minWidth: '220px', zIndex: 1050 }}
              >
                {estaLogado ? (
                  <>
                    <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: 34, height: 34, backgroundColor: '#1b4332', fontSize: '0.85rem' }}
                      >
                        U
                      </div>
                      <div className="overflow-hidden">
                        <span className="d-block small fw-bold text-dark text-truncate">
                          {usuario?.nome || currentUser?.name || 'Usuário NutriFlow'}
                        </span>
                        <span className="d-block text-success small" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-check-circle-fill me-1"></i>Conectado
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/salvos"
                      onClick={() => setMenuPerfilAberto(false)}
                      className="btn btn-light btn-sm text-start mb-2 d-flex align-items-center gap-2 text-secondary rounded-3"
                    >
                      <i className="bi bi-bookmark-heart text-danger"></i>
                      Receitas Salvas ({totalSalvos})
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        sair()
                        setMenuPerfilAberto(false)
                      }}
                      className="btn btn-outline-danger btn-sm w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Sair (Logout)
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-3">
                      <i className="bi bi-person-circle fs-3 text-secondary"></i>
                      <p className="small text-muted mb-0 mt-1">Você está desconectado</p>
                    </div>

                    <Link
                      to="/login"
                      onClick={() => setMenuPerfilAberto(false)}
                      className="btn text-white btn-sm w-100 rounded-3 fw-semibold shadow-sm"
                      style={{ backgroundColor: '#1b4332' }}
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Entrar (Login)
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={() => setMenuPerfilAberto(false)}
                      className="btn btn-light btn-sm w-100 rounded-3 fw-semibold mt-2"
                    >
                      Criar conta
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// CATÁLOGO COMPLETO DE ALIMENTOS CADASTRADOS
const ALIMENTOS_BASE = [
  {
    id: 1,
    nome: 'Arroz Branco Cozido',
    categoria: 'Grãos',
    porcao: '100g',
    calorias: '130 kcal',
    carboidratos: '28g',
    proteinas: '2.7g',
    gorduras: '0.3g',
    fibras: '0.4g',
    alergenos: [],
    imagem: '/arrozbranco.png',
  },
  {
    id: 2,
    nome: 'Batata Inglesa Cozida',
    categoria: 'Legumes',
    porcao: '100g',
    calorias: '86 kcal',
    carboidratos: '20g',
    proteinas: '1.7g',
    gorduras: '0.1g',
    fibras: '1.8g',
    alergenos: [],
    imagem: '/batatainglesa.jpg',
  },
  {
    id: 3,
    nome: 'Banana Prata',
    categoria: 'Frutas',
    porcao: '1 unidade (100g)',
    calorias: '98 kcal',
    carboidratos: '26g',
    proteinas: '1.3g',
    gorduras: '0.1g',
    fibras: '2.0g',
    alergenos: [],
    imagem: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 4,
    nome: 'Peito de Frango Desfiado',
    categoria: 'Proteínas',
    porcao: '100g',
    calorias: '165 kcal',
    carboidratos: '0g',
    proteinas: '31g',
    gorduras: '3.6g',
    fibras: '0g',
    alergenos: [],
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 5,
    nome: 'Cenoura Crua',
    categoria: 'Legumes',
    porcao: '100g',
    calorias: '41 kcal',
    carboidratos: '10g',
    proteinas: '0.9g',
    gorduras: '0.2g',
    fibras: '2.8g',
    alergenos: [],
    imagem: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 6,
    nome: 'Aveia em Flocos',
    categoria: 'Grãos',
    porcao: '30g',
    calorias: '115 kcal',
    carboidratos: '20g',
    proteinas: '4.3g',
    gorduras: '2.2g',
    fibras: '2.9g',
    alergenos: ['glúten'],
    imagem: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 7,
    nome: 'Milho Verde Cozido',
    categoria: 'Grãos',
    porcao: '100g',
    calorias: '96 kcal',
    carboidratos: '21g',
    proteinas: '3.4g',
    gorduras: '1.5g',
    fibras: '2.4g',
    alergenos: [],
    imagem: '/bolo-de-milho.jpg',
  },
  {
    id: 8,
    nome: 'Leite de Amêndoas (Vegetal)',
    categoria: 'Laticínios',
    porcao: '200ml',
    calorias: '39 kcal',
    carboidratos: '1.5g',
    proteinas: '1.0g',
    gorduras: '2.5g',
    fibras: '0.5g',
    alergenos: ['castanhas'],
    imagem: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=60',
  },
]

function Alimentos() {
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')

  const categorias = ['Todas', 'Frutas', 'Legumes', 'Grãos', 'Proteínas', 'Laticínios']

  const filtrados = ALIMENTOS_BASE.filter((alimento) => {
    const atendeTexto = alimento.nome.toLowerCase().includes(busca.toLowerCase())
    const atendeCat = categoriaAtiva === 'Todas' || alimento.categoria === categoriaAtiva
    return atendeTexto && atendeCat
  })

  return (
    <main className="container py-5">
      <div className="text-center mx-auto mb-5" style={{ maxWidth: '680px' }}>
        <h1 className="fw-bold mb-2" style={{ color: '#1b4332' }}>
          Tabela Nutricional de Alimentos
        </h1>
        <p className="text-secondary small mb-4">
          Consulte informações nutricionais, macronutrientes e alérgenos de cada ingrediente.
        </p>

        {/* BUSCA DE ALIMENTOS */}
        <div className="input-group bg-white rounded-pill shadow-sm p-1 border mb-4">
          <span className="input-group-text bg-transparent border-0 ps-3">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none ps-2"
            placeholder="Buscar alimento ou ingrediente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button
              type="button"
              className="btn btn-link text-secondary text-decoration-none border-0 pe-3"
              onClick={() => setBusca('')}
            >
              Limpar
            </button>
          )}
        </div>

        {/* FILTROS POR CATEGORIA */}
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaAtiva(cat)}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                categoriaAtiva === cat
                  ? 'text-white'
                  : 'btn-light border text-secondary'
              }`}
              style={categoriaAtiva === cat ? { backgroundColor: '#1b4332', borderColor: '#1b4332' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE ALIMENTOS */}
      {filtrados.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          Nenhum alimento encontrado com os filtros selecionados.
        </div>
      ) : (
        <div className="row g-4">
          {filtrados.map((alimento) => (
            <div className="col-12 col-md-6 col-lg-3" key={alimento.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <img
                  src={alimento.imagem}
                  alt={alimento.nome}
                  className="w-100"
                  style={{ height: 160, objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=60'
                  }}
                />
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill mb-2">
                      {alimento.categoria}
                    </span>
                    <h6 className="fw-bold text-dark mb-1">{alimento.nome}</h6>
                    <small className="text-muted d-block mb-3">Porção: {alimento.porcao}</small>

                    {/* MACRONUTRIENTES */}
                    <div className="bg-light rounded-3 p-2 small mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Calorias:</span>
                        <span className="fw-bold text-dark">{alimento.calorias}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Carboidratos:</span>
                        <span className="fw-semibold text-dark">{alimento.carboidratos}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Proteínas:</span>
                        <span className="fw-semibold text-dark">{alimento.proteinas}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">Fibras:</span>
                        <span className="fw-semibold text-dark">{alimento.fibras}</span>
                      </div>
                    </div>
                  </div>

                  {/* ALÉRGENOS */}
                  <div>
                    {alimento.alergenos.length === 0 ? (
                      <span className="badge bg-light text-secondary border rounded-pill w-100 text-center">
                        Livre de alérgenos
                      </span>
                    ) : (
                      alimento.alergenos.map((alerg) => (
                        <span
                          key={alerg}
                          className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill w-100 text-center"
                        >
                          Contém {alerg}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
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
              <Route path="/" element={usuario ? <Home /> : <Visualizacao />} />
              <Route path="/alimentos" element={<RotaProtegida><Alimentos /></RotaProtegida>} />
              <Route path="/receitas" element={<RotaProtegida><Receitas /></RotaProtegida>} />
              <Route path="/salvos" element={<RotaProtegida><Salvos /></RotaProtegida>} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
            </Routes>
          </div>

          {/* FOOTER NATIVO COMPLETO */}
          <footer className="bg-white border-top py-4 text-secondary small mt-auto">
            <div className="container">
              <div className="row align-items-center g-3">
                <div className="col-12 col-md-6 text-center text-md-start">
                  <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{ width: 22, height: 22, backgroundColor: '#1b4332' }}
                    >
                      <i className="bi bi-flower1" style={{ fontSize: '0.75rem' }}></i>
                    </div>
                    <span className="fw-bold" style={{ color: '#1b4332' }}>NutriFlow</span>
                  </div>
                  <span className="text-muted small">
                    Comida boa é vida que flui — Saúde, nutrição e bem-estar para o seu dia a dia.
                  </span>
                </div>

                <div className="col-12 col-md-6 text-center text-md-end">
                  <div className="d-flex justify-content-center justify-content-md-end gap-3 mb-1">
                    <Link to="/" className="text-decoration-none text-secondary hover-success">Início</Link>
                    <Link to="/alimentos" className="text-decoration-none text-secondary hover-success">Alimentos</Link>
                    <Link to="/receitas" className="text-decoration-none text-secondary hover-success">Receitas</Link>
                    <Link to="/salvos" className="text-decoration-none text-secondary hover-success">Salvos</Link>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    &copy; {new Date().getFullYear()} NutriFlow. Todos os direitos reservados.
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </RoteadorSeguro>
    </RecipeProvider>
  )
}