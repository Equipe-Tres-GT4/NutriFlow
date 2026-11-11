import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../service/api'
import { Avatar } from '../components/Avatar'
import './SocialExtra.css'

const nomes = { nao_e_receita: 'Não é receita', conteudo_improprio: 'Conteúdo impróprio', spam: 'Spam', assedio: 'Assédio', informacao_enganosa: 'Informação enganosa', outro: 'Outro' }
const labels = { pendente: 'Pendente', mantida: 'Mantida', removida: 'Removida', orientada: 'Orientada' }
export default function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState([])
  const [status, setStatus] = useState('pendente')
  const [pendentes, setPendentes] = useState(0)
  const [observacoes, setObservacoes] = useState({})
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(null)
  const carregar = useCallback(async () => {
    try { const r = await api(`/admin/reports?status=${status}`); setDenuncias(r.denuncias); setPendentes(r.pendentes); setErro('') }
    catch (e) { setErro(e.message) }
  }, [status])
  useEffect(() => {
    let ativo = true
    api(`/admin/reports?status=${status}`).then(r => {
      if (!ativo) return
      setDenuncias(r.denuncias); setPendentes(r.pendentes); setErro('')
    }).catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [status])
  async function decidir(d, acao) {
    const observacao = (observacoes[d.id] || '').trim()
    if (observacao.length < 10) { setErro('Escreva uma justificativa de pelo menos 10 caracteres para registrar a decisão.'); return }
    if (acao === 'remover' && !window.confirm(`Remover permanentemente “${d.tituloSnapshot}”? Esta ação também remove comentários e favoritos vinculados.`)) return
    setErro(''); setAviso(''); setOcupado(d.id)
    try {
      const r = await api(`/admin/reports/${d.id}/review`, { method: 'POST', body: { acao, observacao } })
      setAviso(r.mensagem); await carregar()
    } catch (e) { setErro(e.message) }
    finally { setOcupado(null) }
  }
  return <main className="container nf-extra py-4 py-md-5" style={{ maxWidth: 1060 }}>
    <div className="nf-admin-header"><div><span className="text-success fw-bold small"><i className="bi bi-shield-check"/> MODERAÇÃO NUTRIFLOW</span><h1>Painel de denúncias</h1><p className="text-secondary">Avalie cada solicitação antes de decidir. A resposta é enviada por chat privado ao autor e ao denunciante.</p></div><div className="nf-admin-pending"><strong>{pendentes}</strong><small>aguardando análise</small></div></div>
    <nav className="nf-admin-filters" aria-label="Filtrar denúncias">{[['pendente','Pendentes'], ['mantida','Mantidas'], ['removida','Removidas'], ['orientada','Orientadas'], ['todos','Todas']].map(([value,nome]) => <button key={value} className={status === value ? 'selected' : ''} onClick={() => setStatus(value)}>{nome}</button>)}</nav>
    {erro && <div role="alert" className="alert alert-danger">{erro}</div>}{aviso && <div role="status" className="alert alert-success">{aviso}</div>}
    {!denuncias.length && <div className="nf-admin-empty"><i className="bi bi-shield-check"/><h2>Nenhuma denúncia neste filtro</h2><p>Quando alguém denunciar um conteúdo, ele aparecerá aqui para revisão.</p></div>}
    <div className="nf-admin-list">{denuncias.map(d => <article key={d.id} className="nf-admin-report">
      <div className="d-flex justify-content-between gap-2 flex-wrap"><span className="nf-report-code">DENÚNCIA #{d.id} · {new Date(d.createdAt).toLocaleString('pt-BR')}</span><span className={`nf-report-status ${d.status}`}>{labels[d.status]}</span></div>
      <h2>{d.tituloSnapshot}</h2><div className="mb-2"><span className="badge text-bg-light">{d.tipoAlvo === 'publicacao' ? 'Publicação' : 'Perfil'}</span> <span className="badge text-bg-warning">{nomes[d.motivo] || d.motivo}</span></div>
      {d.detalhes && <p className="nf-admin-description">Relato: {d.detalhes}</p>}
      {d.publicacao && <div className="nf-admin-preview">{d.publicacao.imagemUrl && <img src={d.publicacao.imagemUrl} alt="Mídia da publicação denunciada" loading="lazy"/>}<div><strong>Conteúdo denunciado</strong><p>{d.publicacao.conteudo.slice(0, 700)}</p>{d.publicacao.receitaId && <Link to={`/receitas/${encodeURIComponent(`local:${d.publicacao.receitaId}`)}`} target="_blank">Abrir receita completa</Link>}</div></div>}
      <div className="nf-admin-people"><span><Avatar pessoa={d.denunciante} pequeno/><span><small>Denunciante</small><strong>{d.denunciante?.nome}</strong></span></span><span><Avatar pessoa={d.autorAlvo} pequeno/><span><small>Autor denunciado</small><strong>{d.autorAlvo?.nome}</strong></span></span></div>
      <div className="nf-admin-actions"><Link to={d.tipoAlvo === 'publicacao' && d.publicacao?.receitaId ? `/receitas/${encodeURIComponent(`local:${d.publicacao.receitaId}`)}` : d.tipoAlvo === 'usuario' ? `/participantes/${d.alvoId}` : `/comunidade?post=${d.alvoId}`} target="_blank">Consultar conteúdo/perfil</Link><Link to={`/mensagens?com=${d.denuncianteId}`}>Conversar com denunciante</Link><Link to={`/mensagens?com=${d.autorAlvoId}`}>Conversar com autor</Link></div>
      {d.status === 'pendente' ? <div className="nf-admin-decision"><label htmlFor={`justificativa-${d.id}`}>Justificativa para os envolvidos</label><textarea id={`justificativa-${d.id}`} className="form-control" maxLength={1200} rows={3} placeholder="Explique a decisão de forma respeitosa e objetiva..." value={observacoes[d.id] || ''} onChange={e => setObservacoes(o => ({ ...o, [d.id]: e.target.value }))}/><div className="d-flex gap-2 flex-wrap"><button type="button" className="btn btn-outline-success" disabled={ocupado === d.id} onClick={() => decidir(d,'manter')}>Manter conteúdo</button>{d.tipoAlvo === 'usuario' && <button type="button" className="btn btn-warning" disabled={ocupado === d.id} onClick={() => decidir(d,'orientar')}>Enviar orientação ao perfil</button>}{d.tipoAlvo === 'publicacao' && <button type="button" className="btn btn-danger" disabled={ocupado === d.id} onClick={() => decidir(d,'remover')}>Remover publicação</button>}</div><small className="text-secondary">Para perfis, a equipe pode enviar orientação por mensagem. A exclusão automática de contas não está habilitada.</small></div>
      : <div className="nf-admin-resolution"><strong>Decisão registrada</strong><p>{d.observacaoAdmin}</p></div>}
    </article>)}</div>
  </main>
}
