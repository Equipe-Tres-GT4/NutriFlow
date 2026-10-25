import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const lerUsuarios = () => JSON.parse(localStorage.getItem('usuarios') || '[]')

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() =>
    JSON.parse(localStorage.getItem('sessao') || 'null')
  )

  function cadastrar({ nome, email, senha }) {
    const usuarios = lerUsuarios()
    if (usuarios.some((u) => u.email === email)) {
      throw new Error('Este e-mail já está cadastrado.')
    }
    localStorage.setItem('usuarios', JSON.stringify([...usuarios, { nome, email, senha }]))
  }

  function entrar({ email, senha }) {
    const encontrado = lerUsuarios().find((u) => u.email === email && u.senha === senha)
    if (!encontrado) throw new Error('E-mail ou senha incorretos.')
    const sessao = { nome: encontrado.nome, email: encontrado.email } // nunca guarde a senha na sessão
    localStorage.setItem('sessao', JSON.stringify(sessao))
    setUsuario(sessao)
  }

  function sair() {
    localStorage.removeItem('sessao')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cadastrar, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)