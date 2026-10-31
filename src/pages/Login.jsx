import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const auth = useAuth() || {};
  // Garante compatibilidade caso o método no AuthContext se chame 'entrar', 'login' ou 'logar'
  const entrar = auth.entrar || auth.login || auth.logar || (() => { throw new Error("Função de login não encontrada no AuthContext"); });
  
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function enviar(e) {
    e.preventDefault();

    if (modoRecuperacao) {
      const email = form.email.trim().toLowerCase();
      if (senhaNova.length < 6) {
        setErro('A senha precisa ter pelo menos 6 caracteres.');
        setSucesso('');
        return;
      }
      if (senhaNova !== confirmarSenha) {
        setErro('As senhas não coincidem.');
        setSucesso('');
        return;
      }

      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      const indiceUsuario = usuarios.findIndex((usuario) => usuario.email === email);
      if (indiceUsuario === -1) {
        setErro('Não encontramos uma conta com este e-mail.');
        setSucesso('');
        return;
      }

      usuarios[indiceUsuario].senha = senhaNova;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      setErro('');
      setSenhaNova('');
      setConfirmarSenha('');
      setModoRecuperacao(false);
      setSucesso('Senha alterada. Você já pode entrar com a nova senha.');
      return;
    }

    try {
      entrar(form);
      setErro('');
      navigate('/'); // Retorna para a página principal após logar com sucesso
    } catch (err) {
      setSucesso('');
      setErro(err?.message || 'Ocorreu um erro ao entrar.');
    }
  }

  return (
    <div className="nf-auth d-flex align-items-center justify-content-center p-3 my-5">
      <form onSubmit={enviar} className="nf-card card p-4 p-md-5 shadow-sm border-0" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">
            <i className="bi bi-flower2 me-2"></i>{modoRecuperacao ? 'Redefinir senha' : 'NutriFlow'}
          </h2>
          <p className="text-secondary small mb-0">
            {modoRecuperacao ? 'Informe seu e-mail e escolha uma nova senha' : 'Entre e descubra o que há em seus alimentos'}
          </p>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">E-mail</label>
          <input
            name="email"
            type="email"
            className="form-control form-control-lg fs-6"
            value={form.email}
            onChange={mudar}
            required
          />
        </div>

        {modoRecuperacao ? (
          <>
            <div className="alert alert-info py-2 small" role="note">
              Este protótipo não envia e-mails. A senha será alterada diretamente neste navegador.
            </div>
            <div className="mb-3">
              <label htmlFor="nova-senha" className="form-label small fw-semibold">Nova senha</label>
              <input
                id="nova-senha"
                type="password"
                className="form-control form-control-lg fs-6"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmar-senha" className="form-label small fw-semibold">Confirme a nova senha</label>
              <input
                id="confirmar-senha"
                type="password"
                className="form-control form-control-lg fs-6"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label htmlFor="login-senha" className="form-label small fw-semibold">Senha</label>
              <div className="input-group">
                <input
                  id="login-senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  className="form-control form-control-lg fs-6"
                  value={form.senha}
                  onChange={mudar}
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
            <div className="text-end mb-3">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none"
                onClick={() => { setModoRecuperacao(true); setErro(''); setSucesso(''); }}
              >
                Esqueceu a senha?
              </button>
            </div>
          </>
        )}

        {erro && <div className="alert alert-danger py-2 small" role="alert">{erro}</div>}
        {sucesso && <div className="alert alert-success py-2 small" role="status">{sucesso}</div>}

        <button type="submit" className="btn btn-primary btn-lg w-100 mt-2 fs-6 fw-bold">
          {modoRecuperacao ? 'Redefinir senha' : 'Entrar'}
        </button>

        {modoRecuperacao ? (
          <p className="text-center small mt-3 mb-0">
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-decoration-none"
              onClick={() => { setModoRecuperacao(false); setErro(''); setSucesso(''); }}
            >
              Voltar para entrar
            </button>
          </p>
        ) : (
          <p className="text-center small mt-3 mb-0">
            Não tem conta? <Link to="/cadastro" className="text-decoration-none fw-semibold">Cadastre-se</Link>
          </p>
        )}

        <hr className="my-3 text-muted" />

        <div className="text-center">
          <Link to="/" className="text-secondary small text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Continuar navegando sem entrar
          </Link>
        </div>
      </form>
    </div>
  );
}
