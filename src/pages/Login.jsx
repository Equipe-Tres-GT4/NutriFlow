import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    try {
      await entrar(form)
      const destino = location.state?.from
      navigate(typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/', { replace: true })
    } catch (err) {
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
        <input name="email" type="email" className="form-control form-control-lg" value={form.email} onChange={mudar} required />
      </div>
      <div className="mb-3">
        <label className="form-label small fw-semibold">Senha</label>
        <input name="senha" type="password" className="form-control form-control-lg" value={form.senha} onChange={mudar} required />
      </div>

      {location.state?.contaCriada && <div className="alert alert-success py-2 small" role="status">Conta criada! Entre com seu e-mail e sua senha.</div>}
      {erro && <div className="alert alert-danger py-2 small" role="alert">{erro}</div>}

      <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">Entrar</button>
      <p className="text-center small mt-3 mb-0">Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </form>
  </div>
)
}