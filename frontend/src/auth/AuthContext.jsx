import { useState, useEffect } from 'react'
import { api } from '../service/api'

import { AuthContext } from './AuthContextValue'
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // O protótipo anterior guardava senhas em texto puro no navegador.
    // Não há migração segura sem autenticação no servidor; contas locais devem ser recriadas.
    localStorage.removeItem('usuarios')
    localStorage.removeItem('nutriflow_usuario_ativo')
    let ativo = true
    api('/auth/me')
      .then(({ usuario }) => { if (ativo) setUsuario(usuario) })
      .catch(() => { if (ativo) setUsuario(null) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  async function cadastrar(dados) {
    const r = await api('/auth/register', { method: 'POST', body: dados })
    setUsuario(r.usuario)
    return r.usuario
  }
  async function entrar(dados) {
    const r = await api('/auth/login', { method: 'POST', body: dados })
    setUsuario(r.usuario)
    return r.usuario
  }
  async function sair() {
    try { await api('/auth/logout', { method: 'POST' }) }
    finally { setUsuario(null) }
  }
  async function atualizarPerfil(dados) {
    const r = await api('/profile', { method: 'PATCH', body: dados })
    setUsuario(r.usuario)
    return r.usuario
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, estaAutenticado: Boolean(usuario), cadastrar, entrar, sair, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}
