import { useState } from 'react'
import { Link } from 'react-router-dom'

const iniciais = nome => String(nome || 'NF').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()

/** Mesmo avatar no feed, nos perfis e nos comentários. Nunca expõe dados privados. */
export function Avatar({ pessoa, pequeno = false, className = '' }) {
  const [urlComErro, setUrlComErro] = useState('')
  const imagemValida = pessoa?.fotoUrl && pessoa.fotoUrl !== urlComErro
  return <span className={`nf-avatar-foto ${pequeno ? 'nf-avatar-mini' : ''} ${className}`.trim()}>
    {imagemValida
      ? <img src={pessoa.fotoUrl} alt="" loading="lazy" onError={() => setUrlComErro(pessoa.fotoUrl)} />
      : <span aria-hidden="true">{iniciais(pessoa?.nome)}</span>}
  </span>
}

export function AutorComentario({ autor, autorId, data }) {
  const nome = autor?.nome || 'Participante'
  const conteudo = <><Avatar pessoa={autor} pequeno /><span className="nf-comment-author-details"><strong>{nome}</strong>{autor?.isDemo && <span className="nf-demo-tiny">DEMO</span>}{data && <time dateTime={data}>{new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>}</span></>
  return autorId ? <Link to={`/participantes/${autorId}`} className="nf-comment-author-link" aria-label={`Ver perfil de ${nome}`}>{conteudo}</Link> : <span className="nf-comment-author-link">{conteudo}</span>
}
