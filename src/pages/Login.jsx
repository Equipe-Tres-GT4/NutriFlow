import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [mostrar, setMostrar] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const enviar = async (e) => {
    e.preventDefault(); setErro(''); setEnviando(true)
    try { await entrar(form); navegar('/comunidade') }
    catch (err) { setErro(err.message) }
    finally { setEnviando(false) }
  }
  return (
    <main className="container py-5" style={{ maxWidth: 480 }}>
      <form onSubmit={enviar} className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
        <h1 className="h3 fw-bold text-success">Entrar no NutriFlow</h1>
        <p className="text-secondary small">Entre para compartilhar receitas e conversar com a comunidade.</p>
        <label className="form-label fw-semibold" htmlFor="login-email">E-mail</label>
        <input id="login-email" type="email" autoComplete="email" required className="form-control mb-3" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
        <label className="form-label fw-semibold" htmlFor="login-senha">Senha</label>
        <div className="input-group mb-3">
          <input id="login-senha" type={mostrar ? 'text' : 'password'} autoComplete="current-password" required className="form-control" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })}/>
          <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrar(!mostrar)}>{mostrar ? 'Ocultar' : 'Mostrar'}</button>
        </div>
        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        <button className="btn btn-success py-2" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <p className="text-secondary small mt-3 mb-0">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        <p className="text-secondary small mt-2">Por segurança, redefinição de senha exige futura integração com e-mail; nunca é feita só informando o endereço.</p>
      </form>
    </main>
  )
}
