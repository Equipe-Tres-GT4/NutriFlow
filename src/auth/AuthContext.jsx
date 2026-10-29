import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const lerUsuarios = () => {
  const dados = localStorage.getItem('usuarios')
  if (!dados) return []

  try {
    const usuarios = JSON.parse(dados)
    if (!Array.isArray(usuarios)) throw new Error('Formato inválido')
    return usuarios
  } catch {
    throw new Error('Não foi possível ler as contas salvas neste navegador. Os dados existentes foram mantidos.')
  }
}

const salvarUsuarios = (usuarios) => {
  try {
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
  } catch {
    throw new Error('Não foi possível salvar neste navegador. Os dados existentes foram mantidos.')
  }
}

const emailValido = (email) => /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)

const lerSessao = () => {
  try {
    return JSON.parse(localStorage.getItem('sessao') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao)

  function cadastrar({ nome, email, senha }) {
    nome = nome.trim()
    email = email.trim().toLowerCase()
    if (!nome) throw new Error('Digite seu nome.')
    if (!emailValido(email)) {
      throw new Error('Digite um e-mail válido, como nome@exemplo.com.')
    }
    if (senha.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.')

    const usuarios = lerUsuarios()
    if (usuarios.some((u) => u.email === email)) {
      throw new Error('Este e-mail já está cadastrado.')
    }
    salvarUsuarios([...usuarios, { nome, email, senha }])
  }

  function entrar({ email, senha }) {
    email = email.trim().toLowerCase()
    if (!emailValido(email)) {
      throw new Error('Digite um e-mail válido, como nome@exemplo.com.')
    }

    const encontrado = lerUsuarios().find((u) => u.email === email && u.senha === senha)
    if (!encontrado) throw new Error('E-mail ou senha incorretos.')
    const sessao = { nome: encontrado.nome, email: encontrado.email } // nunca guarde a senha na sessão
    localStorage.setItem('sessao', JSON.stringify(sessao))
    setUsuario(sessao)
  }

  function redefinirSenha({ email, senha }) {
    email = email.trim().toLowerCase()
    if (!emailValido(email)) {
      throw new Error('Digite um e-mail válido, como nome@exemplo.com.')
    }
    if (senha.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.')

    const usuarios = lerUsuarios()
    const indiceUsuario = usuarios.findIndex((u) => u.email === email)
    if (indiceUsuario === -1) throw new Error('Não encontramos uma conta com este e-mail.')

    const usuariosAtualizados = usuarios.map((usuario, indice) =>
      indice === indiceUsuario ? { ...usuario, senha } : usuario
    )
    salvarUsuarios(usuariosAtualizados)
  }

  function sair() {
    localStorage.removeItem('sessao')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cadastrar, entrar, redefinirSenha, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)