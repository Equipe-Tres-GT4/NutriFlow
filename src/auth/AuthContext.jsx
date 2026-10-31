import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem('nutriflow_usuario_ativo')
      return salvo ? JSON.parse(salvo) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('nutriflow_usuario_ativo', JSON.stringify(usuario))
    } else {
      localStorage.removeItem('nutriflow_usuario_ativo')
    }
  }, [usuario])

  function cadastrar({ nome, email, senha }) {
    const emailLimpo = email.trim().toLowerCase()
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    if (usuarios.some((u) => u.email === emailLimpo)) {
      throw new Error('Já existe uma conta com este e-mail.')
    }

    const novo = {
      id: Date.now(),
      nome: nome.trim(),
      email: emailLimpo,
      senha,
      telefone: '',
      peso: '',
      altura: '',
      objetivo: 'Saúde e Longevidade',
      restricoes: '',
      receitasSalvas: [],
      receitasCriadas: []
    }

    usuarios.push(novo)
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
  }

  function entrar({ email, senha }) {
    const emailLimpo = email.trim().toLowerCase()
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    const conta = usuarios.find((u) => u.email === emailLimpo && u.senha === senha)
    if (!conta) {
      throw new Error('E-mail ou senha incorretos.')
    }

    const { senha: _, ...dadosSessao } = conta
    setUsuario(dadosSessao)
  }

  function sair() {
    setUsuario(null)
  }

  function alternarSalvarReceita(receita) {
    if (!usuario) {
      throw new Error('Faça login para salvar esta receita.')
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const idx = usuarios.findIndex((u) => u.email === usuario.email)
    if (idx === -1) return

    const salvas = usuarios[idx].receitasSalvas || []
    const existe = salvas.some((r) => r.id === receita.id)

    const novasSalvas = existe
      ? salvas.filter((r) => r.id !== receita.id)
      : [...salvas, receita]

    usuarios[idx].receitasSalvas = novasSalvas
    localStorage.setItem('usuarios', JSON.stringify(usuarios))

    setUsuario((prev) => ({ ...prev, receitasSalvas: novasSalvas }))
  }

  function atualizarPerfil(dadosComplementares) {
    if (!usuario) return

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const idx = usuarios.findIndex((u) => u.email === usuario.email)
    if (idx === -1) return

    const usuarioAtualizado = {
      ...usuarios[idx],
      ...dadosComplementares
    }

    usuarios[idx] = usuarioAtualizado
    localStorage.setItem('usuarios', JSON.stringify(usuarios))

    const { senha: _, ...sessaoAtualizada } = usuarioAtualizado
    setUsuario(sessaoAtualizada)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: Boolean(usuario),
        entrar,
        cadastrar,
        sair,
        alternarSalvarReceita,
        atualizarPerfil
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider')
  }
  return contexto
}