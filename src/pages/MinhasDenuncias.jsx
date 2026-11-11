import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../service/api'
export default function MinhasDenuncias() {
  const [denuncias, setDenuncias] = useState([])
  const [erro,setErro] = useState('')
  useEffect(() => { api('/reports/mine').then(r=>setDenuncias(r.denuncias)).catch(e=>setErro(e.message)) }, [])
  return <main className="container py-5" style={{ maxWidth: 760 }}><Link to="/comunidade" className="text-success">← Comunidade</Link><h1 className="mt-3">Minhas denúncias</h1><p className="text-secondary">Acompanhamento privado. A equipe envia sua resposta por <Link to="/mensagens">mensagem</Link>.</p>{erro && <div className="alert alert-danger" role="alert">{erro}</div>}{!denuncias.length && !erro && <p>Você ainda não enviou denúncias.</p>}{denuncias.map(d=><article key={d.id} className="card border-0 rounded-4 shadow-sm mb-3 p-3"><strong>{d.tituloSnapshot}</strong><span className="small text-secondary">Enviada em {new Date(d.createdAt).toLocaleString('pt-BR')}</span><span className="text-success">Situação: {d.status === 'pendente' ? 'aguardando análise' : d.status === 'mantida' ? 'conteúdo mantido' : d.status === 'orientada' ? 'orientação enviada ao perfil' : 'conteúdo removido'}</span></article>)}</main>
}
