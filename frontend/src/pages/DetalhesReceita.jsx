import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../service/api'
import { Avatar, AutorComentario } from '../components/Avatar'
import { useAuth } from '../auth/useAuth'
import Denunciar from '../components/Denunciar'
import './DetalhesReceita.css'

function VideoReceita({ video, imagem, nome }) {
  if (!video) return null
  let embed = ''
  try {
    const u = new URL(video, window.location.origin)
    const host = u.hostname.toLowerCase()
    const id = host === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)
      ? (u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : '')) : ''
    if (/^[a-zA-Z0-9_-]{11}$/.test(id)) embed = `https://www.youtube-nocookie.com/embed/${id}`
  } catch { /* vídeos locais não precisam ser interpretados como URLs externas */ }
  const direto = /^\/api\/media\/[-a-f0-9]{36}\.(mp4|webm)$/i.test(video) || /^https?:\/\/[^\s]+\.(mp4|webm)(?:\?[^\s]*)?$/i.test(video)
  if (!embed && !direto) return null
  return <section className="nf-recipe-video" aria-label="Vídeo de preparo da receita">
    <div className="nf-video-heading"><span className="nf-video-eyebrow"><i className="bi bi-play-circle-fill"/> ASSISTA</span><h2>Veja como preparar</h2><p>Assista ao vídeo publicado junto desta receita.</p></div>
    {embed ? <iframe src={embed} title={`Vídeo de preparo: ${nome}`} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>
      : <video controls playsInline preload="metadata" poster={imagem || undefined} aria-label={`Vídeo: ${nome}`}><source src={video} type={video.toLowerCase().split('?')[0].endsWith('.webm') ? 'video/webm' : 'video/mp4'}/>Seu navegador não oferece suporte a este vídeo.</video>}
  </section>
}

function ComentariosDaReceita({ postId, usuario }) {
  const [comentarios, setComentarios] = useState([])
  const [comentario, setComentario] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  async function carregar() { setComentarios((await api(`/posts/${postId}/comments`)).comentarios) }
  useEffect(() => {
    let ativo = true
    api(`/posts/${postId}/comments`).then(r => { if (ativo) setComentarios(r.comentarios) }).catch(e => { if (ativo) setErro(e.message) }).finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [postId])
  async function enviar(e) {
    e.preventDefault(); if (comentario.trim().length < 2) return
    setErro(''); setEnviando(true)
    try {
      await api(`/posts/${postId}/comments`, { method: 'POST', body: { texto: comentario.trim() } })
      setComentario(''); await carregar()
    } catch (e) { setErro(e.message) }
    finally { setEnviando(false) }
  }
  async function excluir(id) {
    setErro('')
    try { await api(`/comments/${id}`, { method: 'DELETE' }); await carregar() }
    catch (e) { setErro(e.message) }
  }
  return <section className="nf-detail-discussion" id="comentarios">
    <div className="nf-discussion-heading"><h2>Conversa sobre a receita <span>{comentarios.length}</span></h2><p>Você preparou? Tire dúvidas, conte sua experiência ou compartilhe uma dica.</p></div>
    {carregando && <p role="status">Carregando comentários...</p>}
    {!carregando && comentarios.length === 0 && <p className="small text-secondary">Ainda não há comentários. Comece a conversa!</p>}
    <div className="nf-detail-comment-list">
      {comentarios.map(c => <article key={c.id} className="nf-detail-comment">
        <AutorComentario autor={c.autor} autorId={c.autorId} data={c.createdAt}/>
        <p>{c.texto}</p>
        {usuario?.id === c.autorId && <button type="button" className="nf-subtle-danger" onClick={() => excluir(c.id)}>Excluir</button>}
      </article>)}
    </div>
    {usuario ? <form className="nf-detail-comment-form" onSubmit={enviar}>
      <Avatar pessoa={usuario} pequeno />
      <div className="nf-detail-comment-write"><label htmlFor="nf-comment">Seu comentário</label><div className="nf-detail-comment-compose"><input id="nf-comment" value={comentario} onChange={e => setComentario(e.target.value)} required minLength={2} maxLength={1000} placeholder="Conte como ficou sua versão..."/><button disabled={enviando || comentario.trim().length < 2}>{enviando ? 'Enviando...' : 'Publicar'}</button></div></div>
    </form> : <p className="small"><Link to="/login">Entre na conta</Link> para comentar e compartilhar seu preparo.</p>}
    {erro && <p role="alert" className="alert alert-danger mt-3">{erro}</p>}
  </section>
}

export default function DetalhesReceita() {
  const { id } = useParams()
  return <DetalhesReceitaConteudo key={id} id={id}/>
}

function DetalhesReceitaConteudo({ id }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [receita, setReceita] = useState(null)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [versoes, setVersoes] = useState([])
  const [postId, setPostId] = useState(null)

  useEffect(() => {
    let ativo = true
    api(`/recipes/${encodeURIComponent(id)}`).then(r => {
      if (!ativo) return
      setReceita(r.receita)
      if (id.startsWith('local:')) {
        const numero = id.slice(6)
        api(`/recipes/${numero}/versions`).then(r => { if (ativo) setVersoes(r.versoes) }).catch(() => {})
        api(`/recipes/${numero}/post`).then(r => { if (ativo) setPostId(r.postId) }).catch(() => {})
      }
    }).catch(e => { if (ativo) setErro(e.message) }).finally(() => { if (ativo) setCarregando(false) })
    if (usuario) api('/saved/recipes').then(r => { if (ativo) setSalvo(r.receitas.some(s => s.chave === id)) }).catch(() => {})
    return () => { ativo = false }
  }, [id, usuario])

  async function alternarSalvo() {
    if (!usuario) return navigate('/login')
    try {
      await api(`/saved/recipes${salvo ? `/${encodeURIComponent(id)}` : ''}`, { method: salvo ? 'DELETE' : 'POST', ...(salvo ? {} : { body: { chave: id } }) })
      setSalvo(!salvo)
    } catch (e) { setErro(e.message) }
  }
  async function excluir() {
    if (!window.confirm('Excluir sua receita? Versões feitas por outros usuários serão preservadas.')) return
    try { await api(`/recipes/${id.slice(6)}`, { method: 'DELETE' }); navigate('/receitas') }
    catch (e) { setErro(e.message) }
  }
  if (carregando) return <main className="container py-5" role="status">Carregando receita...</main>
  if (erro && !receita) return <main className="container py-5"><div role="alert" className="alert alert-danger">{erro}</div><Link to="/comunidade">Voltar à comunidade</Link></main>
  if (!receita) return null
  const ingredientes = receita.ingredientes || []
  const origem = receita.receitaOriginalId
  return <main className="nf-recipe-details container py-4 py-md-5">
    <Link to="/comunidade" className="nf-back">← Voltar ao feed</Link>
    <article className="nf-detail-panel mt-3">
      <div className="nf-detail-cover"><img src={receita.imagem || '/receita.jpg'} alt={`Apresentação de ${receita.nome}`} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/receita.jpg' }}/></div>
      <div className="nf-detail-content">
        <span className="nf-detail-label">{origem ? 'VERSÃO CRIADA PELA COMUNIDADE' : 'RECEITA PARA EXPERIMENTAR'}</span>
        <h1>{receita.nome}</h1>
        <div className="nf-detail-meta">
          {receita.autor ? <Link to={`/participantes/${receita.autor.id}`} className="nf-detail-author"><Avatar pessoa={receita.autor} pequeno/><strong>{receita.autor.nome}</strong>{receita.autor.isDemo && <span className="nf-demo-tiny">DEMO</span>}</Link> : <span>Fonte: {receita.fonte || 'Catálogo'}</span>}
        </div>
        {receita.resumo && <p className="nf-recipe-summary">{receita.resumo}</p>}
        <div className="nf-recipe-facts">
          {receita.tempoMin && <div><i className="bi bi-clock"/><span>Tempo</span><strong>{receita.tempoMin} min</strong></div>}
          {receita.porcoes && <div><i className="bi bi-people"/><span>Rendimento</span><strong>{receita.porcoes} {receita.porcoes === 1 ? 'porção' : 'porções'}</strong></div>}
          {receita.dificuldade && <div><i className="bi bi-bar-chart"/><span>Dificuldade</span><strong>{receita.dificuldade}</strong></div>}
          <div><i className="bi bi-basket"/><span>Ingredientes</span><strong>{ingredientes.length}</strong></div>
        </div>
        {origem && <p className="nf-version-origin">Esta receita é uma adaptação da <Link to={`/receitas/${encodeURIComponent(`local:${origem}`)}`}>versão original</Link>. O preparo e os ingredientes foram personalizados.</p>}
        <div className="nf-detail-buttons"><button type="button" onClick={alternarSalvo} className="nf-detail-primary"><i className={`bi ${salvo ? 'bi-bookmark-fill' : 'bi-bookmark'}`}/>{salvo ? 'Salva na coleção' : 'Salvar receita'}</button>
          <Link to={usuario ? `/receitas/cadastrar?versao=${encodeURIComponent(id)}` : '/login'} className="nf-detail-outline"><i className="bi bi-arrow-repeat"/> Criar minha versão</Link>
          {usuario && id.startsWith('local:') && <Link to={`/mensagens?receita=${id.slice(6)}`} className="nf-detail-outline"><i className="bi bi-send"/> Enviar por mensagem</Link>}
          {receita.autor?.id === usuario?.id && <button type="button" onClick={excluir} className="nf-detail-danger"><i className="bi bi-trash"/> Excluir minha receita</button>}
        </div>
        {postId && <Denunciar tipoAlvo="publicacao" alvoId={postId} autorId={receita.autor?.id}/>}
        {erro && <div role="alert" className="alert alert-danger">{erro}</div>}
        {receita.fotoCredito && <p className="nf-detail-credit">Fotografia ilustrativa: <a href={receita.fotoCredito.url} target="_blank" rel="noopener noreferrer">{receita.fotoCredito.autor}</a> · {receita.fotoCredito.licenca} · {receita.fotoCredito.fonte}</p>}
        <VideoReceita video={receita.video} imagem={receita.imagem} nome={receita.nome}/>
        <div className="nf-detail-columns"><section><h2><i className="bi bi-list-check"/> Ingredientes</h2><ul>{ingredientes.map((i, n) => <li key={n}>{typeof i === 'string' ? i : `${i.medida ? `${i.medida} de ` : ''}${i.nome}`}</li>)}</ul></section><section><h2><i className="bi bi-journal-text"/> Modo de preparo</h2><p className="nf-preparo">{receita.preparo}</p>{receita.fonte === 'TheMealDB' && <p className="small text-secondary">Receita externa fornecida pela TheMealDB; o conteúdo pode estar em inglês.</p>}</section></div>
        {versoes.length > 0 && <section className="nf-detail-versions"><h2>Versões feitas pela comunidade</h2><p className="small text-secondary">Veja como outras pessoas adaptaram a receita.</p><div className="nf-version-grid">{versoes.filter(v => v.id !== id).map(v => <Link key={v.id} to={`/receitas/${encodeURIComponent(v.id)}`}><img src={v.imagem || '/receita.jpg'} alt=""/><span><strong>{v.nome}</strong><small>por {v.autor?.nome || 'Participante'}</small></span></Link>)}</div></section>}
        {postId && <ComentariosDaReceita postId={postId} usuario={usuario}/>}
      </div>
    </article>
  </main>
}
