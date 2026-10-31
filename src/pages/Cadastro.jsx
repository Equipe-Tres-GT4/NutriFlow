import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function enviar(e) {
    e.preventDefault()
    if (form.senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    if (form.senha !== form.confirmarSenha) return setErro('As senhas não coincidem.')
    try {
      cadastrar({ nome: form.nome, email: form.email, senha: form.senha })
      navigate('/login')
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div className="nf-auth d-flex align-items-center justify-content-center p-3 my-5">
      <form onSubmit={enviar} className="nf-card card p-4 p-md-5 shadow-sm border-0" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">
            <i className="bi bi-flower2 me-2"></i>Criar conta
          </h2>
          <p className="text-secondary small mb-0">Cadastre-se para acompanhar sua rotina saudável</p>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Nome</label>
          <input
            name="nome"
            className="form-control form-control-lg fs-6"
            value={form.nome}
            onChange={mudar}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">E-mail</label>
          <input
            name="email"
            type="email"
            pattern="[^\s@]+@[^\s@.]+(\.[^\s@.]+)+"
            title="Use um e-mail com domínio, como nome@exemplo.com."
            className="form-control form-control-lg fs-6"
            value={form.email}
            onChange={mudar}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cadastro-senha" className="form-label small fw-semibold">Senha</label>
          <div className="input-group">
            <input
              id="cadastro-senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              className="form-control form-control-lg fs-6"
              value={form.senha}
              onChange={mudar}
              minLength={6}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="cadastro-confirmar-senha" className="form-label small fw-semibold">Confirme a senha</label>
          <input id="cadastro-confirmar-senha" name="confirmarSenha" type="password" className="form-control form-control-lg" value={form.confirmarSenha} onChange={mudar} required />
        </div>

        {erro && <p className="alert alert-danger py-2 small mb-3" role="alert">{erro}</p>}

        <button type="submit" className="btn btn-primary btn-lg w-100 fs-6 fw-bold">Cadastrar</button>
        <p className="text-center small mt-3 mb-0">
          Já tem conta? <Link to="/login" className="text-decoration-none fw-semibold">Entrar</Link>
        </p>

        <hr className="my-3 text-muted" />

        <div className="text-center">
          <Link to="/" className="text-secondary small text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Voltar para a tela principal
          </Link>
        </div>
      </form>
    </div>
  )
}