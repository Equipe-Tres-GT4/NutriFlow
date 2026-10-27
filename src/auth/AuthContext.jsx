import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const CHAVE_USUARIOS = 'nf-demo-usuarios-v2'
const CHAVE_SESSAO = 'nf-demo-sessao-v2'

function lerJSON(storage, chave, fallback) {
  try { return JSON.parse(storage.getItem(chave) || 'null') ?? fallback } catch { return fallback }
}

function lerUsuarios() {
  const lista = lerJSON(localStorage, CHAVE_USUARIOS, [])
  return Array.isArray(lista) ? lista : []
}

function lerLegados() {
  const lista = lerJSON(localStorage, 'usuarios', [])
  return Array.isArray(lista) ? lista : []
}

function hex(buffer) { return [...new Uint8Array(buffer)].map((n) => n.toString(16).padStart(2, '0')).join('') }
function fromHex(value) { return Uint8Array.from(value.match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16)) }

async function derivarSenha(senha, saltHex) {
  // Melhoria do DEMO: PBKDF2 com salt, não senha em texto puro. Um frontend isolado NÃO substitui autenticação de servidor.
  if (!globalThis.crypto?.subtle) throw new Error('O cadastro requer HTTPS ou localhost para usar a API criptográfica.')
  const salt = saltHex ? fromHex(saltHex) : globalThis.crypto.getRandomValues(new Uint8Array(16))
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, chave, 256)
  return { salt: hex(salt), hash: hex(hash) }
}

function emailNormalizado(email) { return String(email || '').trim().toLowerCase() }
function sessaoPublica(registro) { return { nome: registro.nome, email: registro.email, preferencias: registro.preferencias || [] } }

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const sessao = lerJSON(sessionStorage, CHAVE_SESSAO, null)
    return sessao && typeof sessao.email === 'string' && typeof sessao.nome === 'string' ? sessao : null
  })

  async function cadastrar({ nome, email, senha, preferencias = [] }) {
    const emailLimpo = emailNormalizado(email)
    if (!emailLimpo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) throw new Error('Informe um e-mail válido.')
    if (String(nome).trim().length < 2 || String(nome).trim().length > 100) throw new Error('Informe um nome válido.')
    if (typeof senha !== 'string' || senha.length < 8 || !/[A-Za-zÀ-ÿ]/.test(senha) || !/\d/.test(senha)) throw new Error('A senha precisa ter pelo menos 8 caracteres, letras e números.')
    if (lerUsuarios().some((u) => u.email === emailLimpo) || lerLegados().some((u) => emailNormalizado(u.email) === emailLimpo)) throw new Error('Este e-mail já está cadastrado.')
    const { salt, hash } = await derivarSenha(senha)
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([...lerUsuarios(), { nome: nome.trim(), email: emailLimpo, salt, hash, preferencias }]))
  }

  async function entrar({ email, senha }) {
    const emailLimpo = emailNormalizado(email)
    const registro = lerUsuarios().find((u) => u.email === emailLimpo)
    if (registro) {
      if (typeof registro.salt !== 'string' || typeof registro.hash !== 'string') throw new Error('Cadastro inválido. Consulte o administrador.')
      const { hash } = await derivarSenha(senha, registro.salt)
      if (hash !== registro.hash) throw new Error('E-mail ou senha incorretos.')
      const sessao = sessaoPublica(registro)
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
      setUsuario(sessao)
      return
    }
    // Compatibilidade temporária com contas do protótipo antigo; migra para hash após login.
    const legado = lerLegados().find((u) => emailNormalizado(u.email) === emailLimpo && u.senha === senha)
    if (!legado) throw new Error('E-mail ou senha incorretos.')
    const { salt, hash } = await derivarSenha(senha)
    const migrado = { nome: legado.nome, email: emailLimpo, preferencias: legado.preferencias || [], salt, hash }
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([...lerUsuarios(), migrado]))
    const restantes = lerLegados().filter((u) => emailNormalizado(u.email) !== emailLimpo)
    if (restantes.length) localStorage.setItem('usuarios', JSON.stringify(restantes))
    else localStorage.removeItem('usuarios')
    localStorage.removeItem('sessao')
    const sessao = sessaoPublica(migrado)
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    setUsuario(sessao)
  }

  function atualizarPerfil({ nome, preferencias = [] }) {
    if (!usuario) throw new Error('Entre na sua conta para atualizar o perfil.')
    const novoNome = String(nome || '').trim()
    if (novoNome.length < 2 || novoNome.length > 100) throw new Error('Digite um nome entre 2 e 100 caracteres.')
    const idsPermitidos = ['gluten', 'lactose', 'vegetariano', 'vegano']
    const novasPreferencias = Array.isArray(preferencias) ? preferencias.filter((id) => idsPermitidos.includes(id)) : []
    const usuarios = lerUsuarios()
    if (!usuarios.some((registro) => registro.email === usuario.email)) throw new Error('Cadastro não encontrado neste navegador.')
    const atualizados = usuarios.map((registro) => registro.email === usuario.email ? { ...registro, nome: novoNome, preferencias: novasPreferencias } : registro)
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(atualizados))
    const novaSessao = { ...usuario, nome: novoNome, preferencias: novasPreferencias }
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(novaSessao))
    setUsuario(novaSessao)
  }

  function sair() {
    sessionStorage.removeItem(CHAVE_SESSAO)
    localStorage.removeItem('sessao')
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, cadastrar, entrar, sair, atualizarPerfil }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
