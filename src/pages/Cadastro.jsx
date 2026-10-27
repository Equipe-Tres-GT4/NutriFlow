import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import './Cadastro.css'

const PREFERENCIAS = [
  { id: 'gluten', nome: 'Sem glúten', icone: 'bi-slash-circle' },
  { id: 'lactose', nome: 'Sem lactose', icone: 'bi-droplet' },
  { id: 'vegetariano', nome: 'Vegetariano', icone: 'bi-flower1' },
  { id: 'vegano', nome: 'Vegano', icone: 'bi-heart' },
]

const CAMPOS = ['nome', 'email', 'senha', 'confirmarSenha']
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarCampo(campo, form) {
  if (campo === 'nome') {
    if (!form.nome.trim()) return 'Informe seu nome.'
    if (form.nome.trim().length < 2) return 'Digite pelo menos 2 caracteres.'
  }

  if (campo === 'email') {
    if (!form.email.trim()) return 'Informe seu e-mail.'
    if (!EMAIL_VALIDO.test(form.email.trim())) return 'Digite um e-mail válido.'
  }

  if (campo === 'senha') {
    if (!form.senha) return 'Crie uma senha.'
    if (form.senha.length < 8) return 'Use pelo menos 8 caracteres.'
    if (!/[A-Za-zÀ-ÿ]/.test(form.senha) || !/\d/.test(form.senha)) {
      return 'Combine letras e números na sua senha.'
    }
  }

  if (campo === 'confirmarSenha') {
    if (!form.confirmarSenha) return 'Confirme sua senha.'
    if (form.confirmarSenha !== form.senha) return 'As senhas não são iguais.'
  }

  return ''
}

function forcaDaSenha(senha) {
  if (!senha) return 0
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (/[A-Za-zÀ-ÿ]/.test(senha) && /\d/.test(senha)) pontos++
  if (/[a-zà-ÿ]/.test(senha) && /[A-ZÀ-Ý]/.test(senha)) pontos++
  if (/[^A-Za-zÀ-ÿ\d]/.test(senha) || senha.length >= 12) pontos++
  return Math.max(1, pontos)
}

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' })
  const [preferencias, setPreferencias] = useState([])
  const [tocados, setTocados] = useState({})
  const [erro, setErro] = useState('')
  const [exibirSenha, setExibirSenha] = useState(false)
  const [exibirConfirmacao, setExibirConfirmacao] = useState(false)

  const forca = forcaDaSenha(form.senha)
  const legendaForca = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][forca]

  function mudar(evento) {
    const { name, value } = evento.target
    setForm((anterior) => ({ ...anterior, [name]: value }))
    if (erro) setErro('')
  }

  function alternarPreferencia(id) {
    setPreferencias((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    )
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setTocados(Object.fromEntries(CAMPOS.map((campo) => [campo, true])))

    const primeiroCampoInvalido = CAMPOS.find((campo) => validarCampo(campo, form))
    if (primeiroCampoInvalido) {
      document.getElementById(`cadastro-${primeiroCampoInvalido}`)?.focus()
      return
    }

    try {
      await cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        preferencias,
      })
      navigate('/login', { replace: true, state: { contaCriada: true } })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.')
    }
  }

  function estadoDoCampo(campo) {
    return tocados[campo] && validarCampo(campo, form) ? 'is-invalid' : ''
  }

  return (
    <div className="nf-signup-page">
      <header className="nf-signup-topbar container-xl">
        <Link to="/catalogo" className="nf-signup-brand" aria-label="NutriFlow, ir para o catálogo">
          <span className="nf-signup-brand-icon"><i className="bi bi-flower2" aria-hidden="true" /></span>
          <span>Nutri<span>Flow</span></span>
        </Link>
        <div className="nf-signup-top-links">
          <Link to="/catalogo" className="nf-signup-explore d-none d-sm-inline-flex">
            Explorar alimentos <i className="bi bi-arrow-up-right" aria-hidden="true" />
          </Link>
          <span className="nf-signup-top-divider d-none d-sm-block" />
          <Link to="/login" className="nf-signup-login-link">Já tenho conta <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </div>
      </header>

      <main className="nf-signup-main container-xl">
        <div className="nf-signup-shell row g-0">
          <aside className="nf-signup-story col-lg-5">
            <div className="nf-signup-story-content">
              <span className="nf-signup-eyebrow"><i className="bi bi-stars" aria-hidden="true" /> SUA JORNADA COMEÇA AQUI</span>
              <h2>Comer bem é se sentir <em>bem.</em></h2>
              <p>Alimentação com mais clareza, escolhas com mais confiança e receitas que combinam com você.</p>

              <div className="nf-signup-visual" aria-hidden="true">
                <div className="nf-signup-orbit nf-signup-orbit-1" />
                <div className="nf-signup-orbit nf-signup-orbit-2" />
                <div className="nf-signup-food-card">
                  <div className="nf-signup-food-card-top">
                    <span><i className="bi bi-heart-pulse-fill" /> Seu espaço saudável</span>
                    <i className="bi bi-three-dots" />
                  </div>
                  <div className="nf-signup-food-illustration">
                    <span className="nf-signup-food-piece piece-1">🥑</span>
                    <span className="nf-signup-food-piece piece-2">🥬</span>
                    <span className="nf-signup-food-piece piece-3">🥕</span>
                  </div>
                  <div className="nf-signup-food-card-title">Encontre o que faz bem para você.</div>
                  <div className="nf-signup-food-badges">
                    <span><i className="bi bi-check-circle-fill" /> Sem glúten</span>
                    <span><i className="bi bi-check-circle-fill" /> Sem lactose</span>
                  </div>
                </div>
                <div className="nf-signup-floating-leaf"><i className="bi bi-leaf-fill" /></div>
                <div className="nf-signup-floating-heart"><i className="bi bi-heart-fill" /></div>
              </div>

              <div className="nf-signup-story-footer">
                <span className="nf-signup-benefit-icon"><i className="bi bi-shield-check" aria-hidden="true" /></span>
                <span>Descubra ingredientes, explore receitas e personalize suas preferências.</span>
              </div>
            </div>
          </aside>

          <section className="nf-signup-form-column col-lg-7" aria-labelledby="cadastro-titulo">
            <div className="nf-signup-form-inner">
              <div className="nf-signup-heading">
                <span className="nf-signup-form-eyebrow">BEM-VINDO AO NUTRIFLOW</span>
                <h1 id="cadastro-titulo">Crie sua conta<span>.</span></h1>
                <p>Um espaço para descobrir alimentos e compartilhar uma vida mais leve.</p>
              </div>

              <form onSubmit={enviar} noValidate>
                <div className="nf-signup-form-grid">
                  <div className="nf-signup-field nf-signup-full">
                    <label htmlFor="cadastro-nome" className="form-label">Nome completo <span aria-hidden="true">*</span></label>
                    <div className="nf-signup-input-group">
                      <i className="bi bi-person nf-signup-field-icon" aria-hidden="true" />
                      <input
                        id="cadastro-nome" name="nome" type="text" autoComplete="name"
                        className={`form-control nf-signup-input ${estadoDoCampo('nome')}`}
                        placeholder="Como podemos chamar você?" value={form.nome}
                        onChange={mudar} onBlur={() => setTocados((t) => ({ ...t, nome: true }))}
                        aria-invalid={Boolean(estadoDoCampo('nome'))}
                        aria-describedby={estadoDoCampo('nome') ? 'cadastro-nome-erro' : undefined}
                        minLength={2} maxLength={100} required
                      />
                    </div>
                    {estadoDoCampo('nome') && <div id="cadastro-nome-erro" className="nf-signup-error">{validarCampo('nome', form)}</div>}
                  </div>

                  <div className="nf-signup-field nf-signup-full">
                    <label htmlFor="cadastro-email" className="form-label">Seu melhor e-mail <span aria-hidden="true">*</span></label>
                    <div className="nf-signup-input-group">
                      <i className="bi bi-envelope nf-signup-field-icon" aria-hidden="true" />
                      <input
                        id="cadastro-email" name="email" type="email" autoComplete="email"
                        className={`form-control nf-signup-input ${estadoDoCampo('email')}`}
                        placeholder="voce@exemplo.com" value={form.email}
                        onChange={mudar} onBlur={() => setTocados((t) => ({ ...t, email: true }))}
                        aria-invalid={Boolean(estadoDoCampo('email'))}
                        aria-describedby={estadoDoCampo('email') ? 'cadastro-email-erro' : undefined}
                        maxLength={254} required
                      />
                    </div>
                    {estadoDoCampo('email') && <div id="cadastro-email-erro" className="nf-signup-error">{validarCampo('email', form)}</div>}
                  </div>

                  <div className="nf-signup-field">
                    <label htmlFor="cadastro-senha" className="form-label">Crie uma senha <span aria-hidden="true">*</span></label>
                    <div className="nf-signup-input-group">
                      <i className="bi bi-lock nf-signup-field-icon" aria-hidden="true" />
                      <input
                        id="cadastro-senha" name="senha" type={exibirSenha ? 'text' : 'password'}
                        autoComplete="new-password" className={`form-control nf-signup-input has-toggle ${estadoDoCampo('senha')}`}
                        placeholder="Mínimo de 8 caracteres" value={form.senha}
                        onChange={mudar} onBlur={() => setTocados((t) => ({ ...t, senha: true }))}
                        aria-invalid={Boolean(estadoDoCampo('senha'))}
                        aria-describedby="cadastro-senha-ajuda" minLength={8} required
                      />
                      <button type="button" className="nf-signup-eye" onClick={() => setExibirSenha((v) => !v)}
                        aria-label={exibirSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={exibirSenha}>
                        <i className={`bi ${exibirSenha ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                      </button>
                    </div>
                    {estadoDoCampo('senha') && <div className="nf-signup-error">{validarCampo('senha', form)}</div>}
                  </div>

                  <div className="nf-signup-field">
                    <label htmlFor="cadastro-confirmarSenha" className="form-label">Confirme a senha <span aria-hidden="true">*</span></label>
                    <div className="nf-signup-input-group">
                      <i className="bi bi-shield-lock nf-signup-field-icon" aria-hidden="true" />
                      <input
                        id="cadastro-confirmarSenha" name="confirmarSenha" type={exibirConfirmacao ? 'text' : 'password'}
                        autoComplete="new-password" className={`form-control nf-signup-input has-toggle ${estadoDoCampo('confirmarSenha')}`}
                        placeholder="Repita sua senha" value={form.confirmarSenha}
                        onChange={mudar} onBlur={() => setTocados((t) => ({ ...t, confirmarSenha: true }))}
                        aria-invalid={Boolean(estadoDoCampo('confirmarSenha'))}
                        aria-describedby={estadoDoCampo('confirmarSenha') ? 'cadastro-confirmacao-erro' : undefined} required
                      />
                      <button type="button" className="nf-signup-eye" onClick={() => setExibirConfirmacao((v) => !v)}
                        aria-label={exibirConfirmacao ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'} aria-pressed={exibirConfirmacao}>
                        <i className={`bi ${exibirConfirmacao ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                      </button>
                    </div>
                    {estadoDoCampo('confirmarSenha') && <div id="cadastro-confirmacao-erro" className="nf-signup-error">{validarCampo('confirmarSenha', form)}</div>}
                  </div>
                </div>

                <div className="nf-signup-password-help" id="cadastro-senha-ajuda">
                  <div className="nf-signup-strength-top">
                    <span>Segurança da senha</span>
                    <span aria-live="polite" className={`nf-signup-strength-label strength-${forca}`}>{form.senha ? legendaForca : 'Digite uma senha'}</span>
                  </div>
                  <div className="nf-signup-strength-bars" aria-hidden="true">
                    {[1, 2, 3, 4].map((barra) => <span key={barra} className={forca >= barra ? `active strength-${forca}` : ''} />)}
                  </div>
                  <div className="nf-signup-password-rules">
                    <span className={form.senha.length >= 8 ? 'ok' : ''}>
                      <i className={`bi ${form.senha.length >= 8 ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" /> 8 caracteres ou mais
                    </span>
                    <span className={/[A-Za-zÀ-ÿ]/.test(form.senha) && /\d/.test(form.senha) ? 'ok' : ''}>
                      <i className={`bi ${/[A-Za-zÀ-ÿ]/.test(form.senha) && /\d/.test(form.senha) ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" /> Letras e números
                    </span>
                  </div>
                </div>

                <fieldset className="nf-signup-preferences">
                  <legend>Como você gosta de se alimentar? <span>(opcional)</span></legend>
                  <p>Selecione suas preferências para guardar no seu perfil.</p>
                  <div className="nf-signup-chips">
                    {PREFERENCIAS.map((preferencia) => {
                      const selecionado = preferencias.includes(preferencia.id)
                      return (
                        <button type="button" key={preferencia.id}
                          className={`nf-signup-chip ${selecionado ? 'selected' : ''}`}
                          onClick={() => alternarPreferencia(preferencia.id)} aria-pressed={selecionado}>
                          <i className={`bi ${preferencia.icone}`} aria-hidden="true" />
                          {preferencia.nome}
                          {selecionado && <i className="bi bi-check-lg" aria-hidden="true" />}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                {erro && <div className="alert alert-danger nf-signup-submit-error" role="alert"><i className="bi bi-exclamation-circle" aria-hidden="true" /> {erro}</div>}

                <button type="submit" className="btn nf-signup-submit w-100">
                  Criar minha conta <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
                <p className="nf-signup-bottom-login">Já faz parte do NutriFlow? <Link to="/login">Entrar na minha conta</Link></p>
              </form>
            </div>
          </section>
        </div>
        <div className="nf-signup-footnote">NutriFlow <span>•</span> Informação para escolher melhor. Confira sempre os rótulos dos alimentos.</div>
      </main>
    </div>
  )
}
