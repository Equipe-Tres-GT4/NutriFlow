import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'
import { Avatar, AutorComentario } from '../components/Avatar'
import MidiaUploader from '../components/MidiaUploader'
import Denunciar from '../components/Denunciar'
import './Comunidade.css'

const tipos = { dica: 'Dica', receita: 'Receita', experiencia: 'Experiência' }
const vazio = { titulo: '', conteudo: '', tipo: 'dica', imagemUrl: '', videoUrl: '' }
const dataPublicacao = valor => { try { return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) } catch { return '' } }
const descricao = p => p.receitaId ? (p.receita?.resumo || 'Veja os ingredientes e o passo a passo completo.') : p.conteudo || ''
function MidiaPost({ post }) {
  const [erroFoto, setErroFoto] = useState(false)
  const video = post.receita?.videoUrl || post.videoUrl || ''
  const nome = post.titulo
  let youtube = ''
  try {
    if (video) {
      const u = new URL(video, window.location.origin)
      const host = u.hostname.toLowerCase()
      if (host === 'youtu.be') youtube = u.pathname.split('/')[1]
      if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') youtube = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : '')
      if (!/^[a-zA-Z0-9_-]{11}$/.test(youtube)) youtube = ''
    }
  } catch { /* URL inválida: apenas foto */ }
  const videoDireto = video && (/^\/api\/media\/[-a-f0-9]{36}\.(mp4|webm)$/i.test(video) || /^https?:\/\/[^\s]+\.(mp4|webm)(?:\?[^\s]*)?$/i.test(video))
  const foto = !erroFoto && post.imagemUrl ? post.imagemUrl : '/receita.jpg'
  return <div className="nf-instamedia">
    {youtube ? <iframe title={`Vídeo da receita ${nome}`} src={`https://www.youtube-nocookie.com/embed/${youtube}`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/> : videoDireto ? <video controls preload="metadata" poster={foto} playsInline><source src={video}/><a href={video} target="_blank" rel="noreferrer">Abrir vídeo</a></video> : <Link className="nf-media-photo-link" to={post.receitaId ? `/receitas/${encodeURIComponent(`local:${post.receitaId}`)}` : `/comunidade?post=${post.id}`}><img src={foto} alt={`Imagem ilustrativa de ${nome}`} onError={() => setErroFoto(true)} loading="lazy"/></Link>}
    <span className="nf-media-chip"><i className={`bi ${youtube || videoDireto ? 'bi-camera-video' : 'bi-image'}`}/> {youtube || videoDireto ? 'Vídeo' : tipos[post.tipo] || 'Publicação'}</span>
    {post.receita?.tempoMin && <span className="nf-time-chip"><i className="bi bi-clock"/> {post.receita.tempoMin} min</span>}
  </div>
}
function Comentarios({ postId, usuario, total, onCountChange }) {
  const [aberto, setAberto] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  async function carregar() {
    const r = await api(`/posts/${postId}/comments`)
    setComentarios(r.comentarios)
    onCountChange(postId, r.comentarios.length)
  }
  async function alternar() {
    try { if (!aberto) await carregar(); setAberto(!aberto); setErro('') }
    catch (e) { setErro(e.message) }
  }
  async function enviar(e) {
    e.preventDefault(); if (!texto.trim()) return
    setEnviando(true); setErro('')
    try { await api(`/posts/${postId}/comments`, { method: 'POST', body: { texto } }); setTexto(''); await carregar() }
    catch (e) { setErro(e.message) }
    finally { setEnviando(false) }
  }
  async function excluir(id) {
    try { await api(`/comments/${id}`, { method: 'DELETE' }); await carregar() }
    catch (e) { setErro(e.message) }
  }
  return <div className="nf-post-conversation">
    <button type="button" onClick={alternar} className="nf-comments-trigger" aria-expanded={aberto}><i className="bi bi-chat-square-text"/> {aberto ? 'Fechar comentários' : total > 0 ? `Ver os ${total} comentários` : 'Seja o primeiro a comentar'}</button>
    {aberto && <section className="nf-comments-content" aria-label="Comentários da publicação">
      {!comentarios.length && <p className="text-secondary small">Ainda não há comentários.</p>}
      {comentarios.map(c => <div key={c.id} className="nf-comment-item"><div className="nf-comment-text"><AutorComentario autor={c.autor} autorId={c.autorId} data={c.createdAt}/><p>{c.texto}</p>{usuario?.id === c.autorId && <button type="button" onClick={() => excluir(c.id)} className="nf-subtle-danger">Excluir</button>}</div></div>)}
      {usuario ? <form onSubmit={enviar} className="nf-comment-form"><Avatar pessoa={usuario} pequeno/><label htmlFor={`comentario-${postId}`} className="visually-hidden">Escreva um comentário</label><input id={`comentario-${postId}`} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva um comentário..." maxLength={1000} minLength={2} required/><button disabled={enviando || texto.trim().length < 2}>Publicar</button></form> : <p className="small mb-0"><Link to="/login">Entre na conta</Link> para participar da conversa.</p>}
    </section>}
    {erro && <p className="text-danger small mb-0" role="alert">{erro}</p>}
  </div>
}
export default function Comunidade() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [query] = useSearchParams()
  const postAlvo = /^\d+$/.test(query.get('post') || '') ? query.get('post') : null
  const [posts, setPosts] = useState([])
  const [autores, setAutores] = useState([])
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [autor, setAutor] = useState(() => /^\d+$/.test(query.get('autor') || '') ? query.get('autor') : '')
  const [tipo, setTipo] = useState('receita')
  const [ordem, setOrdem] = useState('recentes')
  const [salvas, setSalvas] = useState(false)
  const salvasValidas = Boolean(usuario && salvas)
  const [feed, setFeed] = useState(() => ['seguindo','seguidores','amigos'].includes(query.get('feed')) ? query.get('feed') : 'todos')
  const feedValido = usuario ? feed : 'todos'
  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState(vazio)
  const [enviandoMidia, setEnviandoMidia] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState({})
  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      if (postAlvo) {
        const r = await api(`/posts/${postAlvo}`)
        setPosts([r.publicacao]); setTotal(1); setErro('')
        return
      }
      const params = new URLSearchParams({ page: String(pagina), q: termo, tipo, sort: ordem })
      if (autor) params.set('autor', autor)
      if (feedValido !== 'todos') params.set('feed', feedValido)
      if (salvasValidas) params.set('salvas', 'minhas')
      const r = await api(`/posts?${params}`)
      setPosts(r.publicacoes); setTotal(r.total); setErro('')
    } catch (e) { setErro(e.message) }
    finally { setCarregando(false) }
  }, [pagina, termo, autor, tipo, ordem, salvasValidas, feedValido, postAlvo])
  useEffect(() => {
    let ativo = true
    const params = new URLSearchParams({ page: String(pagina), q: termo, tipo, sort: ordem })
    if (autor) params.set('autor', autor)
    if (feedValido !== 'todos') params.set('feed', feedValido)
    if (salvasValidas) params.set('salvas', 'minhas')
    const rota = postAlvo ? `/posts/${postAlvo}` : `/posts?${params}`
    api(rota).then(r => {
      if (!ativo) return
      setPosts(postAlvo ? [r.publicacao] : r.publicacoes)
      setTotal(postAlvo ? 1 : r.total)
      setErro('')
    }).catch(e => { if (ativo) setErro(e.message) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [pagina, termo, autor, tipo, ordem, salvasValidas, feedValido, postAlvo])
  useEffect(() => { api('/community/authors').then(r => setAutores(r.autores)).catch(() => {}) }, [])
  const alterarFiltro = (fn, valor) => { setCarregando(true); setPagina(1); fn(valor) }
  const limparFiltros = () => { if (autor || termo || ordem !== 'recentes' || tipo !== 'receita' || salvasValidas || pagina !== 1) setCarregando(true); setAutor(''); setTipo('receita'); setOrdem('recentes'); setTermo(''); setBusca(''); setSalvas(false); setPagina(1) }
  const trocarFeed = modo => { if (modo !== feed || pagina !== 1 || salvas) setCarregando(true); setFeed(modo); setPagina(1); setSalvas(false) }
  async function acao(post, nome, fn) {
    setOcupado(o => ({ ...o, [`${nome}-${post.id}`]: true })); setErro(''); setMensagem('')
    try { await fn() } catch (e) { setErro(e.message) }
    finally { setOcupado(o => ({ ...o, [`${nome}-${post.id}`]: false })) }
  }
  async function seguirAutor(p) {
    if (!usuario) { setMensagem('Entre na conta para seguir pessoas.'); return }
    await acao(p, 'follow', async () => {
      const seguir = !p.seguindoAutor
      const r = await api(`/users/${p.autorId}/follow`, { method: seguir ? 'PUT' : 'DELETE' })
      setPosts(lista => lista.map(item => item.autorId === p.autorId ? { ...item, seguindoAutor: r.seguindo } : item))
      if (!seguir && feedValido !== 'todos') await carregar()
    })
  }
  async function curtir(p) {
    if (!usuario) { setMensagem('Entre na conta para curtir.'); return }
    await acao(p, 'like', async () => {
      const r = await api(`/posts/${p.id}/like`, { method: 'POST' })
      setPosts(prev => prev.map(x => x.id === p.id ? { ...x, curtido: r.curtido, totalCurtidas: r.totalCurtidas } : x))
    })
  }
  async function guardar(p) {
    if (!usuario) { setMensagem('Entre na conta para salvar receitas.'); return }
    if (!p.receitaId) return
    await acao(p, 'save', async () => {
      const chave = `local:${p.receitaId}`
      await api(`/saved/recipes${p.salvo ? `/${encodeURIComponent(chave)}` : ''}`, { method: p.salvo ? 'DELETE' : 'POST', ...(p.salvo ? {} : { body: { chave } }) })
      setPosts(prev => prev.map(x => x.id === p.id ? { ...x, salvo: !p.salvo, totalSalvos: Math.max(0, x.totalSalvos + (p.salvo ? -1 : 1)) } : x))
      if (salvasValidas && p.salvo) await carregar()
    })
  }
  function compartilhar(p) {
    if (!usuario) return navigate('/login')
    navigate(`/mensagens?receita=${p.receitaId}`)
  }
  async function publicar(e) {
    e.preventDefault(); setErro(''); setMensagem('')
    if (enviandoMidia) { setErro('Conclua o envio da foto ou vídeo antes de publicar.'); return }
    setPublicando(true)
    try {
      await api(editando ? `/posts/${editando}` : '/posts', { method: editando ? 'PUT' : 'POST', body: form })
      setForm(vazio); setEditando(null); setFormAberto(false); setTipo('todos'); setPagina(1); setMensagem('Publicação disponível na comunidade.'); await carregar()
    } catch (e) { setErro(e.message) }
    finally { setPublicando(false) }
  }
  function editar(p) { setForm({ titulo: p.titulo, conteudo: p.conteudo, tipo: p.tipo, imagemUrl: p.imagemUrl || '', videoUrl: p.videoUrl || '' }); setEditando(p.id); setFormAberto(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function excluir(id) { if (!window.confirm('Excluir esta publicação?')) return; try { await api(`/posts/${id}`, { method: 'DELETE' }); await carregar() } catch (e) { setErro(e.message) } }
  const atualizarComentarios = (postId, n) => setPosts(ps => ps.map(p => p.id === postId ? { ...p, totalComentarios: n } : p))
  const paginaMaxima = Math.max(1, Math.ceil(total / 12))
  return <main className="nf-social-page">
    <div className="nf-social-column">
      <div className="nf-social-top">
        <div><span className="nf-social-eyebrow">NUTRIFLOW · COMUNIDADE</span><h1>Receitas que inspiram.</h1><p>Descubra o que as pessoas estão preparando e compartilhe sua versão.</p></div>
        <Link to={usuario ? '/receitas/cadastrar' : '/cadastro'} className="nf-publish-cta"><i className="bi bi-plus-lg"/> Criar receita</Link>
      </div>
      {postAlvo && <div className="alert alert-info">Visualizando a publicação #{postAlvo}. <Link to="/comunidade">Voltar ao feed completo</Link></div>}
      <nav className="nf-feed-mode-tabs" aria-label="Escolher feed da comunidade"><button type="button" className={feedValido === 'todos' ? 'active' : ''} onClick={() => trocarFeed('todos')}><i className="bi bi-compass"/> Explorar</button>{usuario && <><button type="button" className={feedValido === 'seguindo' ? 'active' : ''} onClick={() => trocarFeed('seguindo')}><i className="bi bi-person-check"/> Seguindo</button><button type="button" className={feedValido === 'seguidores' ? 'active' : ''} onClick={() => trocarFeed('seguidores')}><i className="bi bi-people"/> Seguidores</button><button type="button" className={feedValido === 'amigos' ? 'active' : ''} onClick={() => trocarFeed('amigos')}><i className="bi bi-heart"/> Amigos</button><Link to="/conexoes"><i className="bi bi-people"/> Conexões</Link></>}</nav>
      <section className="nf-social-filters" aria-label="Buscar e filtrar receitas">
        <form onSubmit={e => { e.preventDefault(); if (termo !== busca.trim() || pagina !== 1) setCarregando(true); setPagina(1); setTermo(busca.trim()) }} className="nf-social-search"><i className="bi bi-search"/><label htmlFor="nf-busca" className="visually-hidden">Pesquisar receitas e pessoas</label><input id="nf-busca" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Receita, ingrediente ou pessoa..."/><button type="submit">Buscar</button></form>
        <div className="nf-social-picks"><label>Ordenar <select value={ordem} onChange={e => alterarFiltro(setOrdem, e.target.value)}><option value="recentes">Recentes</option><option value="populares">Mais curtidas</option><option value="salvas">Mais salvas</option></select></label><label>Autor <select value={autor} onChange={e => alterarFiltro(setAutor, e.target.value)}><option value="">Todos</option>{autores.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label><label>Conteúdo <select value={tipo} onChange={e => alterarFiltro(setTipo, e.target.value)}><option value="receita">Receitas</option><option value="todos">Tudo</option><option value="dica">Dicas</option><option value="experiencia">Experiências</option></select></label>{usuario && <button className={`nf-saved-filter ${salvas ? 'selected' : ''}`} onClick={() => alterarFiltro(setSalvas, !salvas)}><i className="bi bi-bookmark-heart"/> Salvas</button>}{(autor || termo || ordem !== 'recentes' || salvasValidas || tipo !== 'receita') && <button className="nf-clear" onClick={limparFiltros}>Limpar</button>}</div>
      </section>
      {usuario && <div className="nf-tip-creator"><span>Tem uma dica rápida, além de receitas?</span><button type="button" onClick={() => { setFormAberto(!formAberto); setEditando(null); setForm(vazio) }}>{formAberto ? 'Fechar' : 'Compartilhar dica'}</button></div>}
      {formAberto && <form onSubmit={publicar} className="nf-quick-form"><h2 className="h5">{editando ? 'Editar publicação' : 'Compartilhar dica'}</h2><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título" minLength={3} maxLength={140} required/><textarea value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} placeholder="Sua experiência..." minLength={10} maxLength={5000} required/><MidiaUploader imagemUrl={form.imagemUrl} videoUrl={form.videoUrl} onChange={(campo, url) => setForm(f => ({ ...f, [campo]: url }))} onBusyChange={setEnviandoMidia}/><button className="nf-publish-cta" disabled={enviandoMidia || publicando}>{publicando ? 'Publicando...' : editando ? 'Salvar' : 'Publicar'}</button></form>}
      <div className="nf-feed-counter"><strong>{total} {total === 1 ? 'publicação' : 'publicações'}</strong><span>{salvasValidas ? 'Sua coleção' : feedValido === 'seguindo' ? 'Publicações de quem você segue' : feedValido === 'seguidores' ? 'Publicações de quem segue você' : feedValido === 'amigos' ? 'Somente amizades mútuas' : 'Para inspirar sua próxima refeição'}</span></div>
      {mensagem && <div className="alert alert-info" role="status">{mensagem} {!usuario && <Link to="/login">Entrar</Link>}</div>}
      {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
      {carregando && <p role="status" className="nf-loading"><span className="spinner-border spinner-border-sm me-2"/>Carregando publicações...</p>}
      {!carregando && posts.length === 0 && <div className="nf-empty-feed"><i className="bi bi-search-heart"/><h2>{feedValido === 'seguindo' ? 'Seu feed Seguindo está vazio' : feedValido === 'seguidores' ? 'Seu feed Seguidores está vazio' : feedValido === 'amigos' ? 'Ainda não há publicações dos seus amigos' : 'Nenhuma receita com esses filtros'}</h2><p>{feedValido === 'todos' ? 'Experimente outra busca ou veja todas as receitas.' : 'Siga pessoas que publicam receitas. Quando vocês se seguirem, aparecerão também na aba Amigos.'}</p>{feedValido === 'todos' ? <button type="button" onClick={limparFiltros}>Ver todas</button> : <><Link to="/conexoes?aba=descobrir" className="nf-empty-action">Encontrar pessoas</Link> <button type="button" onClick={() => trocarFeed('todos')}>Explorar receitas</button></>}</div>}
      <div className="nf-post-list">
        {posts.map(p => <article key={p.id} className="nf-instapost">
          <header className="nf-post-author"><Link to={`/participantes/${p.autorId}`} className="nf-post-person"><Avatar pessoa={p.autor}/><span className="nf-author-text"><strong>{p.autor?.nome || 'Participante'}</strong><small>{dataPublicacao(p.createdAt)} {p.autor?.isDemo ? '· Perfil demonstrativo' : ''}</small></span></Link><div className="nf-post-right">{usuario && usuario.id !== p.autorId && <button type="button" className={`nf-follow-inline ${p.seguindoAutor ? 'following' : ''}`} disabled={ocupado[`follow-${p.id}`]} onClick={() => seguirAutor(p)}>{p.seguindoAutor ? 'Seguindo ✓' : 'Seguir'}</button>}<span className="nf-post-kind">{p.receita?.receitaOriginalId ? 'Nova versão' : tipos[p.tipo]}</span></div></header>
          <MidiaPost post={p}/>
          <div className="nf-post-body">
            <div className="nf-post-quick-actions"><button type="button" className={p.curtido ? 'on' : ''} title={p.curtido ? 'Descurtir' : 'Curtir'} aria-label={p.curtido ? 'Descurtir receita' : 'Curtir receita'} onClick={() => curtir(p)} disabled={ocupado[`like-${p.id}`]}><i className={`bi ${p.curtido ? 'bi-heart-fill' : 'bi-heart'}`}/></button><button type="button" onClick={() => document.getElementById(`nf-comentarios-${p.id}`)?.click()} aria-label="Comentários"><i className="bi bi-chat"/></button>{p.receitaId && <button type="button" onClick={() => compartilhar(p)} aria-label="Compartilhar receita"><i className="bi bi-send"/></button>}{p.receitaId && <button type="button" className={`nf-save-post ${p.salvo ? 'on' : ''}`} onClick={() => guardar(p)} disabled={ocupado[`save-${p.id}`]} aria-label={p.salvo ? 'Remover dos salvos' : 'Salvar receita'}><i className={`bi ${p.salvo ? 'bi-bookmark-fill' : 'bi-bookmark'}`}/></button>}</div>
            <div className="nf-post-counts"><strong>{p.totalCurtidas} {p.totalCurtidas === 1 ? 'curtida' : 'curtidas'}</strong>{p.receitaId && <span>{p.totalSalvos} {p.totalSalvos === 1 ? 'pessoa salvou' : 'pessoas salvaram'}</span>}</div>
            <h2 className="nf-post-title">{p.receitaId ? <Link to={`/receitas/${encodeURIComponent(`local:${p.receitaId}`)}`}>{p.titulo}</Link> : p.titulo}</h2>
            <p className="nf-post-description">{descricao(p)}</p>
            {p.receitaId && <div className="nf-post-detail-actions"><Link to={`/receitas/${encodeURIComponent(`local:${p.receitaId}`)}`}><i className="bi bi-journal-text"/> Ingredientes e preparo</Link><Link to={usuario ? `/receitas/cadastrar?versao=local:${p.receitaId}` : '/login'}><i className="bi bi-arrow-repeat"/> Criar minha versão</Link></div>}
            {p.receita?.fotoCredito?.url && <p className="nf-photo-credit">Foto ilustrativa: <a href={p.receita.fotoCredito.url} target="_blank" rel="noopener noreferrer">{p.receita.fotoCredito.autor}</a> · {p.receita.fotoCredito.licenca} · {p.receita.fotoCredito.fonte}</p>}
            <div id={`nf-comment-section-${p.id}`}><Comentarios postId={p.id} total={p.totalComentarios} usuario={usuario} onCountChange={atualizarComentarios}/></div>
            {/* Tecla/controle oculto somente para foco no botão real de comentários. */}
            <button id={`nf-comentarios-${p.id}`} type="button" className="visually-hidden" onClick={() => document.querySelector(`#nf-comment-section-${p.id} .nf-comments-trigger`)?.click()}>Abrir comentários</button>
            {usuario?.id === p.autorId ? <div className="nf-owner-actions">{p.receitaId ? <button className="text-danger" type="button" onClick={() => excluir(p.id)}><i className="bi bi-trash"/> Excluir minha receita</button> : <><button type="button" onClick={() => editar(p)}>Editar dica</button><button className="text-danger" type="button" onClick={() => excluir(p.id)}>Excluir dica</button></>}</div> : <Denunciar tipoAlvo="publicacao" alvoId={p.id} autorId={p.autorId}/>}
          </div>
        </article>)}
      </div>
      {paginaMaxima > 1 && <nav className="nf-pagination" aria-label="Paginação"><button disabled={pagina === 1 || carregando} onClick={() => { setCarregando(true); setPagina(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Anterior</button><span>{pagina} de {paginaMaxima}</span><button disabled={pagina >= paginaMaxima || carregando} onClick={() => { setCarregando(true); setPagina(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Próxima</button></nav>}
      <p className="nf-social-disclaimer">Perfis marcados como demonstração são fictícios. Fotos de alimentos de acervos públicos são ilustrativas e creditadas; receitas não substituem orientação nutricional individual.</p>
    </div>
  </main>
}
