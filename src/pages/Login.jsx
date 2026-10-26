import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { entrar } = useAuth()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function enviar(e) {
    e.preventDefault()
    try {
      entrar(form)
      setErro('')
      setSucesso(`Bem-vindo, ${form.email}!`)
    } catch (err) {
      setSucesso('')
      setErro(err.message)
    }
  }

  return (
    <div className="nf-auth d-flex align-items-center justify-content-center p-3">
      <form onSubmit={enviar} className="nf-card p-4 p-md-5" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary"><i className="bi bi-flower2 me-2"></i>NutriFlow</h2>
          <p className="text-secondary small mb-0">Entre e descubra o que há em seus alimentos</p>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">E-mail</label>
          <input name="email" type="email" pattern="[^\s@]+@[^\s@.]+(\.[^\s@.]+)+" title="Use um e-mail com domínio, como nome@exemplo.com." className="form-control form-control-lg" value={form.email} onChange={mudar} required />
        </div>
        <div className="mb-3">
          <label htmlFor="login-senha" className="form-label small fw-semibold">Senha</label>
          <div className="input-group">
            <input id="login-senha" name="senha" type={mostrarSenha ? 'text' : 'password'} className="form-control form-control-lg" value={form.senha} onChange={mudar} required />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha}>
              <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {erro && <div className="alert alert-danger py-2 small" role="alert">{erro}</div>}
  {sucesso && <div className="alert alert-success py-2 small" role="status">{sucesso}</div>}

        <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">Entrar</button>
        <p className="text-center small mt-3 mb-0">Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
      </form>
    </div>
  )
}
