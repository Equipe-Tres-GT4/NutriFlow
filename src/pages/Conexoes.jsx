import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'
import { Avatar } from '../components/Avatar'
import './Conexoes.css'

const abas = [
  { id: 'descobrir', nome: 'Descobrir pessoas', icone: 'bi-search' },
  { id: 'seguindo', nome: 'Seguindo', icone: 'bi-person-check' },
  { id: 'seguidores', nome: 'Seguidores', icone: 'bi-people' },
  { id: 'amigos', nome: 'Amigos', icone: 'bi-heart' },
]

export default function Conexoes() {
  const { usuario } = useAuth()
  const [query, setQuery] = useSearchParams()
  const aba = abas.find(a => a.id === query.get('aba'))?.id || 'descobrir'
  const [resumo, setResumo] = useState({ seguindo: 0, seguidores: 0, amigos: 0 })
  const [pessoas, setPessoas] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(null)

  const atualizarResumo = useCallback(async () => {
    const dados = await api('/social/summary')
    setResumo(dados)
  }, [])
  useEffect(() => {
    let ativo = true
    const params = new URLSearchParams({ page: String(pagina) })
    if (aba === 'descobrir') { if (termo) params.set('q', termo) }
    else params.set('tipo', aba)
    const rota = aba === 'descobrir' ? '/social/people' : '/social/connections'
    api(`${rota}?${params}`).then(resposta => {
      if (!ativo) return
      setPessoas(resposta.pessoas); setTotal(resposta.total)
      return api('/social/summary').then(dados => { if (ativo) setResumo(dados) })
    }).catch(e => { if (ativo) setErro(e.message) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [aba, pagina, termo])
  function trocarAba(nova) { if (nova !== aba || pagina !== 1 || termo) setCarregando(true); setQuery({ aba: nova }); setPagina(1); setBusca(''); setTermo('') }
  async function alternar(pessoa) {
    setOcupado(pessoa.id); setErro('')
    try {
      const seguir = !pessoa.seguindo
      const r = await api(`/users/${pessoa.id}/follow`, { method: seguir ? 'PUT' : 'DELETE' })
      setPessoas(lista => lista.map(p => p.id === pessoa.id ? { ...p, seguindo: r.seguindo, amigos: r.amigos, seguidores: r.seguidores } : p))
      await atualizarResumo()
      if (aba === 'seguindo' && !seguir || aba === 'amigos' && !r.amigos) {
        setPessoas(lista => lista.filter(p => p.id !== pessoa.id)); setTotal(n => Math.max(0, n - 1))
      }
    } catch (e) { setErro(e.message) }
    finally { setOcupado(null) }
  }
  const ultimaPagina = Math.max(1, Math.ceil(total / 20))
  return <main className="nf-connections-page">
    <div className="nf-connections-wrap">
      <div className="nf-connections-header">
        <span className="nf-social-eyebrow">NUTRIFLOW · COMUNIDADE</span>
        <h1>Suas conexões</h1>
        <p>Encontre quem compartilha boas ideias, acompanhe receitas e fortaleça sua comunidade alimentar.</p>
        <div className="nf-connections-stats">
          <button type="button" onClick={() => trocarAba('seguindo')}><strong>{resumo.seguindo}</strong><span>Seguindo</span></button>
          <button type="button" onClick={() => trocarAba('seguidores')}><strong>{resumo.seguidores}</strong><span>Seguidores</span></button>
          <button type="button" onClick={() => trocarAba('amigos')}><strong>{resumo.amigos}</strong><span>Amigos mútuos</span></button>
        </div>
      </div>
      <nav className="nf-connections-tabs" aria-label="Conexões da comunidade">
        {abas.map(item => <button key={item.id} type="button" onClick={() => trocarAba(item.id)} className={aba === item.id ? 'is-active' : ''} aria-current={aba === item.id ? 'page' : undefined}><i className={`bi ${item.icone}`}/> {item.nome}</button>)}
      </nav>
      <div className="nf-connections-content">
        <div className="nf-connections-content-head">
          <div><h2>{abas.find(a => a.id === aba)?.nome}</h2><p>{aba === 'seguindo' ? 'Pessoas cujas publicações aparecem no seu feed Seguindo.' : aba === 'seguidores' ? 'Pessoas que acompanham suas receitas.' : aba === 'amigos' ? 'Pessoas que você segue e que também seguem você.' : 'Descubra participantes da comunidade e acompanhe suas receitas.'}</p></div>
          {aba !== 'descobrir' && <Link to={`/comunidade?feed=${aba === 'amigos' ? 'amigos' : aba === 'seguidores' ? 'seguidores' : 'seguindo'}`} className="nf-connections-feed-link"><i className="bi bi-grid-1x2"/> Ver feed</Link>}
        </div>
        {aba === 'descobrir' && <form onSubmit={e => { e.preventDefault(); if (termo !== busca.trim() || pagina !== 1) setCarregando(true); setPagina(1); setTermo(busca.trim()) }} className="nf-connections-search"><i className="bi bi-search"/><label htmlFor="buscar-pessoas" className="visually-hidden">Pesquisar pessoas</label><input id="buscar-pessoas" placeholder="Pesquisar pelo nome..." value={busca} onChange={e => setBusca(e.target.value)} maxLength={80}/><button type="submit">Buscar</button></form>}
        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        {carregando ? <p role="status" className="nf-loading">Carregando pessoas...</p> : pessoas.length === 0 ? <div className="nf-connections-empty"><i className="bi bi-people"/><h3>{aba === 'descobrir' ? 'Nenhuma pessoa encontrada' : aba === 'seguidores' ? 'Você ainda não tem seguidores' : aba === 'amigos' ? 'Ainda não há amizades mútuas' : 'Você ainda não segue ninguém'}</h3><p>{aba === 'descobrir' ? 'Tente pesquisar outro nome.' : 'Descubra pessoas para começar a criar seu círculo de receitas.'}</p>{aba !== 'descobrir' && <button onClick={() => trocarAba('descobrir')}>Descobrir pessoas</button>}</div> : <ul className="nf-connections-list">
          {pessoas.map(p => <li key={p.id} className="nf-person-card"><Link to={`/participantes/${p.id}`} className="nf-person-link"><Avatar pessoa={p}/><span><strong>{p.nome}</strong><small>{p.isDemo ? 'Perfil demonstrativo · ' : ''}{p.totalReceitas} receitas · {p.seguidores} seguidores</small>{p.amigos && <em><i className="bi bi-heart-fill"/> Vocês se seguem</em>}{p.meSegue && !p.seguindo && <em>Segue você</em>}</span></Link>{p.id !== usuario?.id && <button type="button" onClick={() => alternar(p)} className={`nf-person-follow ${p.seguindo ? 'following' : ''}`} disabled={ocupado === p.id}>{ocupado === p.id ? 'Aguarde...' : p.seguindo ? <><i className="bi bi-check2"/> Seguindo</> : p.meSegue ? 'Seguir de volta' : 'Seguir'}</button>}{p.id !== usuario?.id && <Link className="btn btn-outline-success btn-sm" to={`/mensagens?com=${p.id}`}><i className="bi bi-chat"/> Mensagem</Link>}</li>)}
        </ul>}
        {ultimaPagina > 1 && <div className="nf-pagination"><button disabled={pagina === 1 || carregando} onClick={() => { setCarregando(true); setPagina(n => n - 1) }}>Anterior</button><span>Página {pagina} de {ultimaPagina}</span><button disabled={pagina >= ultimaPagina || carregando} onClick={() => { setCarregando(true); setPagina(n => n + 1) }}>Próxima</button></div>}
      </div>
      <p className="nf-social-disclaimer">Perfis demonstrativos são fictícios. A conta mostra apenas nomes, avatares e conteúdos públicos; dados de saúde e endereço permanecem privados.</p>
    </div>
  </main>
}
