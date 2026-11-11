import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../service/api'
import { useAuth } from '../auth/useAuth'
import Denunciar from '../components/Denunciar'

export default function Participante() {
  const { id } = useParams()
  const { usuario: eu } = useAuth()
  const [dados, setDados] = useState(null)
  const [receitas, setReceitas] = useState([])
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  useEffect(() => {
    let ativo = true
    Promise.all([api(`/users/${id}`), api(`/posts?autor=${encodeURIComponent(id)}&tipo=receita&sort=salvas`)])
      .then(([perfil, feed]) => { if (ativo) { setDados(perfil); setReceitas(feed.publicacoes) } })
      .catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [id])
  async function seguir() {
    try {
      const r = await api(`/users/${id}/follow`, { method: dados.euSigo ? 'DELETE' : 'PUT' })
      setMensagem(r.seguindo ? 'Agora você segue este participante.' : 'Você deixou de seguir este participante.')
      setDados(p => ({ ...p, seguidores: r.seguidores, euSigo: r.seguindo, meSegue: r.meSegue, amigos: r.amigos }))
    } catch (e) { setMensagem(e.message) }
  }
  return <main className="container py-4 py-md-5" style={{ maxWidth: 960 }}>
    <Link to="/comunidade" className="text-success text-decoration-none">← Voltar à comunidade</Link>
    {erro && <p className="alert alert-danger mt-3" role="alert">{erro}</p>}
    {dados && <>
      <div className="card rounded-4 border-0 shadow-sm p-4 mt-3 mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex gap-3 align-items-center">
            {dados.usuario.fotoUrl && <img src={dados.usuario.fotoUrl} alt="" width="76" height="76" style={{objectFit:'cover',borderRadius:'50%'}}/>}
            <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2"><h1 className="h3 fw-bold m-0" style={{ color: '#184d32' }}>{dados.usuario.nome}</h1>{dados.usuario.isDemo && <span className="badge bg-success-subtle text-success">Perfil fictício · DEMO</span>}</div>
            <p className="text-secondary mb-1">{dados.usuario.especialidade || 'Participante da comunidade NutriFlow'}</p>
            <p className="small text-secondary mb-0">{dados.totalReceitas} receitas publicadas · {dados.seguidores} seguidores · {dados.seguindo} seguindo</p>{dados.amigos && <small className="text-success"><i className="bi bi-heart-fill"/> Vocês se seguem</small>}{dados.meSegue && !dados.euSigo && <small className="text-success">Segue você</small>}
            </div>
          </div>
          {eu && eu.id !== dados.usuario.id && <div className="d-flex gap-2 align-items-center flex-wrap"><button type="button" className="btn btn-outline-success" onClick={seguir}>{dados.euSigo ? '✓ Seguindo' : dados.meSegue ? 'Seguir de volta' : 'Seguir'}</button><Link className="btn btn-success" to={`/mensagens?com=${dados.usuario.id}`}><i className="bi bi-chat"/> Mensagem</Link><Denunciar tipoAlvo="usuario" alvoId={dados.usuario.id} autorId={dados.usuario.id}/></div>}
          {!eu && <Link to="/login" className="btn btn-outline-success">Entre para seguir</Link>}
        </div>
        {mensagem && <p role="status" className="small mt-3 mb-0 text-success">{mensagem}</p>}
      </div>
      <section aria-labelledby="receitas-criador"><div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap"><h2 id="receitas-criador" className="h4 fw-bold" style={{ color: '#184d32' }}>Receitas de {dados.usuario.nome}</h2><Link className="text-success" to={`/comunidade?autor=${id}`}>Ver na comunidade</Link></div>
        {receitas.length === 0 && <p className="text-secondary">Este participante ainda não compartilhou receitas.</p>}
        <div className="row g-3">{receitas.map(p => <div key={p.id} className="col-sm-6 col-lg-4"><article className="card h-100 border-0 rounded-4 overflow-hidden shadow-sm">
          <img src={p.imagemUrl || '/receita.jpg'} alt={p.titulo} style={{ height: 180, width: '100%', objectFit: 'cover' }} loading="lazy"/>
          <div className="card-body d-flex flex-column"><h3 className="h6 fw-bold">{p.titulo}</h3><p className="small text-secondary">{p.receita?.tempoMin || '—'} min · {p.totalSalvos} salvos</p><Link className="btn btn-success btn-sm mt-auto" to={`/receitas/${encodeURIComponent(`local:${p.receitaId}`)}`}>Ver receita</Link></div>
        </article></div>)}</div>
      </section>
    </>}
  </main>
}
