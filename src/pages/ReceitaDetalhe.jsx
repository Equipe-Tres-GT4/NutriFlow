import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useComunidade } from '../context/ComunidadeContext'
import { AvisoAlimentar, Vazio } from '../components/Painel'
import { iniciais, resumoRestricoes } from '../utils/nutriflow'

export default function ReceitaDetalhe() {
  const { id } = useParams()
  const { receitas, favoritos, curtidas, comentarios, alternarFavorito, alternarCurtida, adicionarComentario } = useComunidade()
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const receita = receitas.find((r) => r.id === id)
  if (!receita) return <Vazio titulo="Receita não encontrada" descricao="Ela pode ter sido removida, ou o link está incorreto." acao="Voltar às receitas" url="/receitas" />
  const salvo = favoritos.includes(id)
  const curtida = curtidas.includes(id)
  const listaComentarios = Array.isArray(comentarios[id]) ? comentarios[id].filter((c) => c && typeof c.conteudo === 'string').slice(0, 100) : []

  function enviar(evento) {
    evento.preventDefault()
    try { adicionarComentario(id, texto); setTexto(''); setErro(''); setEnviado(true) } catch (error) { setErro(error.message) }
  }

  return <div className="np-page np-detail-page"><nav className="np-backline" aria-label="Trilha de navegação"><Link to="/receitas"><i className="bi bi-arrow-left"/> Voltar às receitas</Link><span>/</span><span>{receita.categoria}</span></nav>
    <div className="np-detail-hero"><div className="np-detail-image"><img src={receita.imagem} alt={`Imagem ilustrativa de ${receita.nome}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/receita.jpg' }}/></div><div className="np-detail-info"><span className="np-overline">{receita.categoria?.toUpperCase()} · {receita.origem === 'comunidade' ? 'ENVIADA PELO USUÁRIO' : 'RECEITA DO CATÁLOGO'}</span><h1>{receita.nome}</h1><p>{receita.descricao}</p><div className="np-recipe-tags np-detail-tags">{resumoRestricoes(receita).map((s) => <span key={s}>{s}</span>)}</div><div className="np-detail-meta"><span><i className="bi bi-clock"/> {receita.tempoPreparo}</span><span><i className="bi bi-people"/> {receita.porcoes} {Number(receita.porcoes) === 1 ? 'porção' : 'porções'}</span></div><div className="np-detail-author"><span className="np-avatar np-author-avatar">{iniciais(receita.autor)}</span><div><strong>{receita.autor}</strong><small>{receita.origem === 'comunidade' ? 'Receita compartilhada' : 'Equipe NutriFlow'}</small></div></div><div className="np-detail-buttons"><button type="button" className="np-primary-link" onClick={() => alternarFavorito(id)} aria-pressed={salvo}><i className={`bi ${salvo ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}`}/> {salvo ? 'Receita salva' : 'Salvar receita'}</button><button type="button" className="np-outline-action" onClick={() => alternarCurtida(id)} aria-pressed={curtida}><i className={`bi ${curtida ? 'bi-heart-fill' : 'bi-heart'}`}/> {curtida ? 'Curtiu' : 'Curtir'}</button></div></div></div>
    <div className="np-detail-columns"><section className="np-detail-sheet"><div className="np-detail-section-title"><span className="np-detail-section-icon"><i className="bi bi-basket3"/></span><div><span className="np-overline">SEPARE TUDO</span><h2>Ingredientes</h2></div></div><ul className="np-ingredients-list">{receita.ingredientes.map((ingrediente, i) => <li key={`${i}-${ingrediente}`}><i className="bi bi-check2-circle" aria-hidden="true"/><span>{ingrediente}</span></li>)}</ul></section><section className="np-detail-sheet"><div className="np-detail-section-title"><span className="np-detail-section-icon"><i className="bi bi-list-ol"/></span><div><span className="np-overline">MÃOS À OBRA</span><h2>Modo de preparo</h2></div></div><ol className="np-steps-list">{receita.modoPreparo.map((passo, i) => <li key={i}><span>{i + 1}</span><p>{passo}</p></li>)}</ol></section></div>
    <div className="np-allergy-warning"><i className="bi bi-shield-exclamation" aria-hidden="true"/><div><strong>Atenção a alergias e restrições</strong><p>{receita.alergicos?.length ? receita.alergicos.join(' ') : 'Não há informações completas de alergênicos nesta receita.'} Ingredientes, marcas, preparo e contaminação cruzada podem alterar a adequação. Confira sempre os rótulos e fontes.</p></div></div>
    <section className="np-comments"><div className="np-section-title"><div><span className="np-overline">COMUNIDADE</span><h2>Comentários ({listaComentarios.length})</h2></div></div><form className="np-comment-form" onSubmit={enviar}><label htmlFor="comentario-texto">Deixe sua experiência ou uma dica</label><textarea id="comentario-texto" rows={3} maxLength={500} value={texto} onChange={(e) => { setTexto(e.target.value); setEnviado(false) }} placeholder="O que você achou dessa receita?" required/><div><span>{texto.length}/500 caracteres</span><button type="submit" className="np-primary-link"><i className="bi bi-send"/> Publicar comentário</button></div>{erro && <p role="alert" className="np-error">{erro}</p>}{enviado && <p role="status" className="np-success">Seu comentário foi guardado neste navegador.</p>}</form>{listaComentarios.length ? <div className="np-comments-list">{listaComentarios.map((c) => <article key={c.id} className="np-comment"><span className="np-avatar">{iniciais(c.autor)}</span><div><strong>{c.autor}</strong><small>{new Date(c.data).toLocaleDateString('pt-BR')}</small><p>{c.conteudo}</p></div></article>)}</div> : <div className="np-no-comments">Ainda não há comentários neste navegador. Seja a primeira pessoa a comentar!</div>}</section><AvisoAlimentar/>
  </div>
}
