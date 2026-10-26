import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function enviar(e) {
    e.preventDefault()
    if (form.senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    try {
      cadastrar(form)
      navigate('/login')
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div className="nf-auth d-flex align-items-center justify-content-center p-3">
      <form onSubmit={enviar} className="nf-card p-4 p-md-5" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary"><i className="bi bi-flower2 me-2"></i>Criar conta</h2>
          <p className="text-secondary small mb-0">Cadastre-se para acompanhar sua rotina saudável</p>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Nome</label>
          <input name="nome" className="form-control form-control-lg" value={form.nome} onChange={mudar} required />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">E-mail</label>
          <input name="email" type="email" pattern="[^\s@]+@[^\s@.]+(\.[^\s@.]+)+" title="Use um e-mail com domínio, como nome@exemplo.com." className="form-control form-control-lg" value={form.email} onChange={mudar} required />
        </div>
        <div className="mb-3">
          <label htmlFor="cadastro-senha" className="form-label small fw-semibold">Senha</label>
          <div className="input-group">
            <input id="cadastro-senha" name="senha" type={mostrarSenha ? 'text' : 'password'} className="form-control form-control-lg" value={form.senha} onChange={mudar} required />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha}>
              <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {erro && <p className="alert alert-danger py-2 small mb-3" role="alert">{erro}</p>}

        <button type="submit" className="btn btn-primary btn-lg w-100">Cadastrar</button>
        <p className="text-center small mt-3 mb-0">Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  )
}
