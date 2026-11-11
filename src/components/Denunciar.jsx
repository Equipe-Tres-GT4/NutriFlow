import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'

const motivos = [
  ['nao_e_receita', 'Não é uma receita ou conteúdo alimentar'],
  ['conteudo_improprio', 'Conteúdo inadequado ou ofensivo'],
  ['spam', 'Spam, publicidade ou fraude'],
  ['assedio', 'Assédio ou intimidação'],
  ['informacao_enganosa', 'Informação enganosa ou perigosa'],
  ['outro', 'Outro motivo'],
]
/** O botão só registra denúncias. Apenas moderadores podem decidir e excluir. */
export default function Denunciar({ tipoAlvo = 'publicacao', alvoId, autorId }) {
  const { usuario } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState(motivos[0][0])
  const [detalhes, setDetalhes] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  if (!usuario || !alvoId || usuario.id === autorId) return null
  async function enviar(e) {
    e.preventDefault(); setAviso(''); setEnviando(true)
    try {
      const r = await api('/reports', { method: 'POST', body: { tipoAlvo, alvoId, motivo, detalhes } })
      setAviso(r.mensagem); setDetalhes(''); setAberto(false)
    } catch (e) { setAviso(e.message) }
    finally { setEnviando(false) }
  }
  return <div className="nf-report-wrapper">
    <button type="button" className="nf-report-button" onClick={() => { setAberto(v => !v); setAviso('') }} aria-expanded={aberto}><i className="bi bi-flag"/> Denunciar</button>
    {aberto && <form className="nf-report-form" onSubmit={enviar}>
      <strong>O que aconteceu?</strong>
      <p className="small text-secondary mb-2">A denúncia é privada e será analisada pela equipe NutriFlow. Não excluímos conteúdo automaticamente.</p>
      <label>Motivo <select className="form-select form-select-sm" value={motivo} onChange={e => setMotivo(e.target.value)}>{motivos.map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}</select></label>
      <label>Detalhes para a equipe (opcional)<textarea className="form-control" maxLength={1200} rows={3} value={detalhes} onChange={e => setDetalhes(e.target.value)} placeholder="Explique o problema com respeito"/></label>
      <div className="d-flex gap-2 flex-wrap align-items-center"><button className="btn btn-danger btn-sm" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar denúncia'}</button><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setAberto(false)}>Cancelar</button><Link to="/minhas-denuncias" className="small">Minhas denúncias</Link></div>
    </form>}
    {aviso && <p role="status" className="small mt-2 mb-0">{aviso}</p>}
  </div>
}
