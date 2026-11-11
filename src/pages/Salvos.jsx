import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../service/api'

/** Coleção pessoal centrada em receitas. Os alimentos salvos antigos seguem no banco, sem exclusão. */
export default function Salvos() {
  const [receitas, setReceitas] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    try {
      const r = await api('/saved/recipes')
      setReceitas(r.receitas || [])
      setErro('')
    } catch (e) { setErro(e.message) }
    finally { setCarregando(false) }
  }

  useEffect(() => {
    let ativo = true
    api('/saved/recipes').then(r => {
      if (!ativo) return
      setReceitas(r.receitas || []); setErro('')
    }).catch(e => { if (ativo) setErro(e.message) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  async function retirar(chave) {
    try {
      await api(`/saved/recipes/${encodeURIComponent(chave)}`, { method: 'DELETE' })
      await carregar()
    } catch (e) { setErro(e.message) }
  }

  return <main className="container py-5">
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <div><h1 className="fw-bold mb-1" style={{ color: '#184d32' }}>Minhas receitas salvas</h1><p className="text-secondary mb-0">Suas inspirações para preparar depois, disponíveis em qualquer dispositivo.</p></div>
      <Link to="/comunidade" className="btn btn-outline-success">Explorar a Comunidade</Link>
    </div>
    {erro && <div role="alert" className="alert alert-danger">{erro}</div>}
    {carregando ? <p role="status">Carregando suas receitas...</p> : receitas.length === 0
      ? <div className="bg-white rounded-4 p-5 text-center"><i className="bi bi-bookmark-heart fs-1 text-success" aria-hidden="true"/><h2 className="h4 mt-3">Sua coleção começa com uma receita</h2><p className="text-secondary">Encontre uma receita no feed e toque em Salvar para guardá-la aqui.</p><Link to="/comunidade" className="btn btn-success">Encontrar receitas</Link></div>
      : <div className="row g-4">{receitas.map(r => <div className="col-sm-6 col-lg-4" key={r.id}><article className="card h-100 rounded-4 border-0 shadow-sm overflow-hidden">
        {r.imagemUrl && <img src={r.imagemUrl} style={{height:210, objectFit:'cover'}} alt={r.nome} loading="lazy"/>}
        <div className="card-body d-flex flex-column"><small className="text-success">{r.fonte}</small><h2 className="h5 mt-1">{r.nome}</h2><div className="d-flex flex-wrap gap-2 mt-auto pt-3"><Link to={`/receitas/${encodeURIComponent(r.chave)}`} className="btn btn-success btn-sm">Ver receita</Link><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => retirar(r.chave)}>Remover dos salvos</button></div></div>
      </article></div>)}</div>}
  </main>
}
