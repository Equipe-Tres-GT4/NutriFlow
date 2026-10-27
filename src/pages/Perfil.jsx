import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AvisoAlimentar, CabecalhoPagina } from '../components/Painel'
import { iniciais, PREFERENCIAS } from '../utils/nutriflow'

export default function Perfil() {
  const { usuario, atualizarPerfil } = useAuth()
  const [nome, setNome] = useState(usuario?.nome || '')
  const [preferencias, setPreferencias] = useState(usuario?.preferencias || [])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  function alternar(id) { setPreferencias((atuais) => atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]) }
  function salvar(evento) {
    evento.preventDefault()
    try { atualizarPerfil({ nome: nome.trim(), preferencias }); setErro(''); setMensagem('Perfil atualizado neste navegador.') } catch (err) { setMensagem(''); setErro(err.message) }
  }
  return <div className="np-page"><CabecalhoPagina etiqueta="MEU ESPAÇO PESSOAL" titulo="Meu perfil" descricao="Organize seu nome e as preferências que ajudam a personalizar a experiência."/>
    <div className="np-profile-layout"><form onSubmit={salvar} className="np-profile-card"><div className="np-profile-card-head"><span className="np-avatar np-profile-avatar">{iniciais(usuario?.nome)}</span><div><h2>{usuario?.nome}</h2><p>Conta NutriFlow</p></div></div><div className="np-profile-section"><h3>Dados da conta</h3><div className="np-form-field"><label htmlFor="perfil-nome">Nome</label><input id="perfil-nome" type="text" minLength={2} maxLength={100} value={nome} onChange={(e) => { setNome(e.target.value); setMensagem('') }} required/></div><div className="np-form-field"><label htmlFor="perfil-email">E-mail (somente leitura)</label><input id="perfil-email" value={usuario?.email || ''} readOnly disabled/><small>O e-mail é usado para identificar os dados deste protótipo.</small></div></div><div className="np-profile-section"><h3>Preferências alimentares</h3><p>Essas preferências são opcionais. Nenhum filtro garante ausência de alergênicos.</p><div className="np-profile-preferences">{PREFERENCIAS.map((f) => <label key={f.id} className={`np-preference-choice ${preferencias.includes(f.id) ? 'chosen' : ''}`}><input type="checkbox" checked={preferencias.includes(f.id)} onChange={() => alternar(f.id)}/><i className={`bi ${f.icone}`} aria-hidden="true"/><span><strong>{f.rotulo}</strong><small>{f.descricao}</small></span></label>)}</div></div>{mensagem && <p className="np-success" role="status"><i className="bi bi-check-circle"/> {mensagem}</p>}{erro && <p className="np-error" role="alert">{erro}</p>}<button type="submit" className="np-primary-link"><i className="bi bi-floppy"/> Salvar alterações</button></form><aside className="np-profile-side"><span className="np-profile-side-icon"><i className="bi bi-shield-lock"/></span><h3>Privacidade em primeiro lugar</h3><p>Para testes, seus dados e publicações são mantidos somente neste navegador. Eles ainda não estão sincronizados com um servidor.</p><ul><li><i className="bi bi-check-circle"/> Preferências podem ser editadas</li><li><i className="bi bi-check-circle"/> O acesso às telas requer login na interface</li><li><i className="bi bi-exclamation-triangle"/> Autenticação segura requer backend</li></ul><div className="np-profile-warning">Não utilize dados reais sensíveis neste protótipo.</div></aside></div><AvisoAlimentar/>
  </div>
}
