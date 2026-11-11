import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../service/api'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../auth/useAuth'
import './SocialExtra.css'

export default function Mensagens() {
  const { usuario: eu } = useAuth()
  const [params, setParams] = useSearchParams()
  const selecionado = Number(params.get('com')) || null
  const [conversas, setConversas] = useState([])
  const [contato, setContato] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [receitasSalvas, setReceitasSalvas] = useState([])
  const [mostrarReceitas, setMostrarReceitas] = useState(false)
  const [receitaSelecionada, setReceitaSelecionada] = useState(null)
  const ultimoRef = useRef(null)
  const compartilharId = /^\d+$/.test(params.get('receita') || '') ? Number(params.get('receita')) : null

  const carregarConversas = useCallback(async () => {
    try { setConversas((await api('/messages/threads')).conversas) }
    catch (e) { setErro(e.message) }
  }, [])
  const carregarChat = useCallback(async (id) => {
    if (!id) return
    try { const r = await api(`/messages/${id}`); setContato(r.usuario); setMensagens(r.mensagens) }
    catch (e) { setErro(e.message) }
  }, [])
  useEffect(() => {
    let ativo = true
    api('/messages/threads').then(r => { if (ativo) setConversas(r.conversas) })
      .catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [])
  useEffect(() => {
    if (!selecionado) return
    let ativo = true
    api(`/messages/${selecionado}`).then(r => { if (ativo) { setContato(r.usuario); setMensagens(r.mensagens) } })
      .catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [selecionado])
  useEffect(() => {
    const t = setInterval(() => { carregarConversas(); if (selecionado) carregarChat(selecionado) }, 7000)
    return () => clearInterval(t)
  }, [selecionado, carregarConversas, carregarChat])
  useEffect(() => { ultimoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [mensagens.length, selecionado])
  useEffect(() => {
    let ativo = true
    if (!busca.trim()) return
    api(`/social/people?q=${encodeURIComponent(busca.trim())}`).then(r => { if (ativo) setResultados(r.pessoas) }).catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [busca])
  const resultadosVisiveis = busca.trim() ? resultados : []
  function abrir(id) { setParams(prev => { const p = new URLSearchParams(prev); p.set('com', String(id)); return p }); setErro(''); setAviso('') }
  async function escolherReceita() {
    try { const r = await api('/saved/recipes'); setReceitasSalvas(r.receitas.filter(x => /^local:[1-9]\d*$/.test(x.chave))); setMostrarReceitas(v => !v) }
    catch (e) { setErro(e.message) }
  }
  async function enviar(e) {
    e.preventDefault()
    const receitaParaEnviar = compartilharId || receitaSelecionada
    if (!selecionado || (!texto.trim() && !receitaParaEnviar)) return
    setOcupado(true); setErro(''); setAviso('')
    try {
      await api('/messages', { method: 'POST', body: { destinatarioId: selecionado, texto: texto.trim(), ...(receitaParaEnviar ? { receitaId: receitaParaEnviar } : {}) } })
      setTexto(''); setReceitaSelecionada(null); setMostrarReceitas(false)
      if (compartilharId) setParams(prev => { const p = new URLSearchParams(prev); p.delete('receita'); return p })
      await Promise.all([carregarChat(selecionado), carregarConversas()])
      setAviso('Mensagem enviada.')
    } catch (e) { setErro(e.message) }
    finally { setOcupado(false) }
  }
  return <main className="nf-extra container py-4 py-md-5">
    <div className="mb-4"><h1 className="fw-bold">Mensagens</h1><p className="text-secondary mb-0">Converse com a comunidade, troque ideias e envie receitas diretamente.</p></div>
    {compartilharId && <div className="alert alert-success"><i className="bi bi-send me-2"/> Receita selecionada para compartilhar. Escolha um contato e envie a mensagem.</div>}
    {erro && <div role="alert" className="alert alert-danger">{erro}</div>}
    <div className="nf-messenger">
      <aside className="nf-chat-sidebar" aria-label="Conversas e contatos">
        <h2>Conversas</h2>
        <form onSubmit={e => e.preventDefault()}><label htmlFor="buscar-contato" className="visually-hidden">Buscar pessoas</label><input className="form-control" id="buscar-contato" value={busca} onChange={e => { setBusca(e.target.value); setResultados([]) }} placeholder="Buscar pessoas..." maxLength={80}/></form>
        {busca && resultadosVisiveis.length > 0 && <div className="nf-chat-search-results"><small className="text-secondary">Iniciar conversa</small>{resultadosVisiveis.filter(p => p.id !== eu?.id).map(p => <button key={p.id} type="button" onClick={() => { abrir(p.id); setBusca('') }}><Avatar pessoa={p} pequeno/>{p.nome}</button>)}</div>}
        <div className="nf-chat-contacts">{conversas.map(c => <button key={c.usuarioId} type="button" onClick={() => abrir(c.usuarioId)} className={selecionado === c.usuarioId ? 'selecionado' : ''}><Avatar pessoa={c.usuario}/><span><strong>{c.usuario?.nome}</strong><small>{c.ultimaMensagem}</small></span>{c.naoLidas > 0 && <b className="nf-chat-unread">{c.naoLidas}</b>}</button>)}{!conversas.length && !busca && <p className="small text-secondary p-3">Ainda não há conversas. Encontre alguém pelo nome ou abra o perfil de uma pessoa.</p>}</div>
      </aside>
      <section className="nf-chat-main" aria-label="Conversa privada">
        {selecionado && contato ? <>
          <header className="nf-chat-header"><Avatar pessoa={contato}/><div><Link to={`/participantes/${contato.id}`}><strong>{contato.nome}</strong></Link><small>Conversa privada</small></div></header>
          <div className="nf-chat-history" role="log" aria-live="polite">{mensagens.map(m => <article key={m.id} className={`nf-bubble ${m.remetenteId === eu?.id ? 'minha' : 'outra'} ${m.tipo === 'moderacao' ? 'mod' : ''}`}><div className="nf-bubble-body">{m.tipo === 'moderacao' && <strong><i className="bi bi-shield-check"/> Mensagem da moderação</strong>}<p>{m.texto}</p>{m.receitaId && <Link to={`/receitas/${encodeURIComponent(`local:${m.receitaId}`)}`} className="nf-recipe-share-link"><i className="bi bi-journal-richtext"/> Ver receita: {m.tituloReceita}</Link>}<time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time></div></article>)}{!mensagens.length && <p className="nf-chat-intro">Diga olá, pergunte sobre uma receita ou compartilhe uma ideia!</p>}<div ref={ultimoRef}/></div>
          {(receitaSelecionada || mostrarReceitas) && <div className="nf-chat-share-picker">{receitaSelecionada && <p className="small mb-1"><i className="bi bi-journal-richtext"/> Receita escolhida: {receitasSalvas.find(r => Number(r.chave.slice(6)) === receitaSelecionada)?.nome || `#${receitaSelecionada}`} <button type="button" className="btn btn-sm btn-link" onClick={() => setReceitaSelecionada(null)}>Remover</button></p>}{mostrarReceitas && <div className="nf-chat-recipe-options">{receitasSalvas.length ? receitasSalvas.map(r => <button type="button" key={r.chave} onClick={() => { setReceitaSelecionada(Number(r.chave.slice(6))); setMostrarReceitas(false) }}><i className="bi bi-journal-richtext"/> {r.nome}</button>) : <span className="small text-secondary">Você ainda não tem receitas da comunidade salvas. Encontre uma no feed e salve-a primeiro.</span>}</div>}</div>}
          <form onSubmit={enviar} className="nf-chat-compose"><button className="btn btn-outline-success" type="button" title="Enviar receita salva" aria-label="Escolher receita para enviar" onClick={escolherReceita}><i className="bi bi-journal-richtext"/></button><label htmlFor="texto-mensagem" className="visually-hidden">Sua mensagem</label><input id="texto-mensagem" className="form-control" placeholder={compartilharId ? 'Comentário ao compartilhar a receita (opcional)' : 'Escreva sua mensagem...'} maxLength={2000} value={texto} onChange={e => setTexto(e.target.value)}/><button type="submit" className="btn btn-success" disabled={ocupado || (!texto.trim() && !compartilharId && !receitaSelecionada)}><i className="bi bi-send"/> Enviar</button></form>
        </> : <div className="nf-chat-placeholder"><i className="bi bi-chat-heart"/><h2>Comece uma conversa</h2><p>Selecione um contato ou pesquise pelo nome para trocar mensagens.</p></div>}
      </section>
    </div>
    {aviso && <p className="small text-success mt-2" role="status">{aviso}</p>}
  </main>
}
