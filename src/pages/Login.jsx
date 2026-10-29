import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { entrar, redefinirSenha } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [modoRecuperacao, setModoRecuperacao] = useState(false)
  const [senhaNova, setSenhaNova] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function enviar(e) {
    e.preventDefault()

    if (modoRecuperacao) {
      if (senhaNova.length < 6) {
        setErro('A senha precisa ter pelo menos 6 caracteres.')
        setSucesso('')
        return
      }
      if (senhaNova !== confirmarSenha) {
        setErro('As senhas não coincidem.')
        setSucesso('')
        return
      }

      try {
        redefinirSenha({ email: form.email, senha: senhaNova })
        setErro('')
        setSenhaNova('')
        setConfirmarSenha('')
        setModoRecuperacao(false)
        setSucesso('Senha alterada. Você já pode entrar com a nova senha.')
      } catch (err) {
        setErro(err.message)
        setSucesso('')
      }
      return
    }

    try {
      entrar(form)
      setErro('')
      navigate('/catalogo')
    } catch (err) {
      setSucesso('')
      setErro(err.message)
    }
  }

  return (
    <div className="nf-auth d-flex align-items-center justify-content-center p-3">
      <form onSubmit={enviar} className="nf-card p-4 p-md-5" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary"><i className="bi bi-flower2 me-2"></i>{modoRecuperacao ? 'Redefinir senha' : 'NutriFlow'}</h2>
          <p className="text-secondary small mb-0">{modoRecuperacao ? 'Informe seu e-mail e escolha uma nova senha' : 'Entre e descubra o que há em seus alimentos'}</p>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">E-mail</label>
          <input name="email" type="email" pattern="[^\s@]+@[^\s@.]+(\.[^\s@.]+)+" title="Use um e-mail com domínio, como nome@exemplo.com." className="form-control form-control-lg" value={form.email} onChange={mudar} required />
        </div>

        {modoRecuperacao ? (
          <>
            <div className="alert alert-info py-2 small" role="note">
              Protótipo local: não há verificação por e-mail. Use apenas uma senha de teste.
            </div>
            <div className="mb-3">
              <label htmlFor="nova-senha" className="form-label small fw-semibold">Nova senha</label>
              <input id="nova-senha" type="password" className="form-control form-control-lg" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} minLength={6} required />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmar-senha" className="form-label small fw-semibold">Confirme a nova senha</label>
              <input id="confirmar-senha" type="password" className="form-control form-control-lg" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} minLength={6} required />
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label htmlFor="login-senha" className="form-label small fw-semibold">Senha</label>
              <div className="input-group">
                <input id="login-senha" name="senha" type={mostrarSenha ? 'text' : 'password'} className="form-control form-control-lg" value={form.senha} onChange={mudar} required />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha}>
                  <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div className="text-end mb-3">
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { setModoRecuperacao(true); setErro(''); setSucesso('') }}>
                Esqueceu a senha?
              </button>
            </div>
          </>
        )}

        {erro && <div className="alert alert-danger py-2 small" role="alert">{erro}</div>}
        {sucesso && <div className="alert alert-success py-2 small" role="status">{sucesso}</div>}

        <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">{modoRecuperacao ? 'Redefinir senha' : 'Entrar'}</button>
        {modoRecuperacao ? (
          <p className="text-center small mt-3 mb-0">
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { setModoRecuperacao(false); setErro(''); setSucesso('') }}>
              Voltar para entrar
            </button>
          </p>
        ) : (
          <p className="text-center small mt-3 mb-0">Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        )}
      </form>
    </div>
  )
}
