import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../service/api'
import MidiaUploader from '../components/MidiaUploader'

const vazio = { nome: '', resumo: '', porcoes: '2', tempoMin: '30', dificuldade: 'Fácil', imagemUrl: '', videoUrl: '', ingredientes: '', preparo: '' }
export default function CadastrarReceita() {
  const [params] = useSearchParams()
  const editar = params.get('editar')
  const versao = params.get('versao')
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({ ...vazio, ingredientes: params.get('ingrediente') || '' }))
  const [original, setOriginal] = useState(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviandoMidia, setEnviandoMidia] = useState(false)
  const [buscaIngrediente, setBuscaIngrediente] = useState('')
  const [opcoesIngrediente, setOpcoesIngrediente] = useState([])
  const [buscandoIngrediente, setBuscandoIngrediente] = useState(false)
  useEffect(() => {
    const referencia = editar || versao
    if (!referencia || !/^local:\d+$/.test(referencia)) return
    let ativo = true
    api(`/recipes/${encodeURIComponent(referencia)}`).then(r => {
      if (!ativo) return
      const v = r.receita
      setForm({ nome: editar ? v.nome : `Minha versão de ${v.nome}`.slice(0, 140), resumo: editar ? (v.resumo || '') : '', porcoes: String(v.porcoes || 2), tempoMin: String(v.tempoMin || 30), dificuldade: v.dificuldade || 'Fácil', imagemUrl: editar ? (v.imagem || '') : '', videoUrl: editar ? (v.video || '') : '', ingredientes: v.ingredientes.map(i => typeof i === 'string' ? i : `${i.medida || ''} ${i.nome || ''}`.trim()).join('\n'), preparo: v.preparo })
      if (versao && !editar) setOriginal({ id: v.receitaOriginalId || Number(referencia.slice(6)), nome: v.nome, autor: v.autor?.nome })
    }).catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [editar, versao])
  function mudar(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }
  async function pesquisarIngrediente(e) { e.preventDefault(); if (buscaIngrediente.trim().length < 2) return; setBuscandoIngrediente(true); try { const r = await api(`/foods?q=${encodeURIComponent(buscaIngrediente.trim())}`); setOpcoesIngrediente(r.alimentos.slice(0, 8)) } catch (e) { setErro(e.message) } finally { setBuscandoIngrediente(false) } }
  function inserirIngrediente(nome) { setForm(f => ({ ...f, ingredientes: f.ingredientes ? `${f.ingredientes.trim()}\n${nome}` : nome })); setOpcoesIngrediente([]); setBuscaIngrediente('') }
  async function enviar(e) {
    e.preventDefault(); setErro('')
    if (enviandoMidia) { setErro('Aguarde o envio da mídia terminar antes de publicar.'); return }
    setSalvando(true)
    try {
      const dados = { ...form, tempoMin: Number(form.tempoMin), porcoes: Number(form.porcoes), ingredientes: form.ingredientes.split('\n').map(x => x.trim()).filter(Boolean) }
      if (original && !editar) dados.receitaOriginalId = original.id
      const r = await api(editar ? `/recipes/${editar.slice(6)}` : '/recipes', { method: editar ? 'PUT' : 'POST', body: dados })
      navigate(`/receitas/${encodeURIComponent(editar || r.receita.id)}`)
    } catch (e) { setErro(e.message) } finally { setSalvando(false) }
  }
  return <main className="container py-5" style={{ maxWidth: 830 }}><Link to={versao ? `/receitas/${encodeURIComponent(versao)}` : '/comunidade'} className="text-success text-decoration-none">← Voltar</Link>
    <section className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mt-3"><div className="d-flex justify-content-between gap-2 align-items-start flex-wrap"><div><p className="text-success small fw-bold mb-2">NUTRIFLOW · RECEITAS</p><h1 className="h2 fw-bold">{editar ? 'Editar minha receita' : original ? 'Crie sua versão da receita' : 'Compartilhe sua receita'}</h1></div><Link to="/comunidade" className="small text-success">Ver o feed</Link></div>
      {original && <div className="alert alert-success">Você está criando uma receita inspirada em <strong>{original.nome}</strong>{original.autor ? `, de ${original.autor}` : ''}. A versão será publicada separadamente, com referência à original.</div>}
      <p className="text-secondary">Inclua uma foto grande ou um vídeo para dar destaque à receita no feed. Os ingredientes e o passo a passo ficam disponíveis para quem quiser preparar.</p>
      {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
      <form onSubmit={enviar} className="row g-3">
        <div className="col-12"><label htmlFor="rc-nome" className="form-label">Nome da receita</label><input id="rc-nome" name="nome" required minLength={3} maxLength={140} value={form.nome} onChange={mudar} className="form-control" placeholder="Ex.: Panqueca de banana com aveia"/></div>
        <div className="col-12"><label htmlFor="rc-resumo" className="form-label">Conte sobre a receita</label><textarea id="rc-resumo" name="resumo" className="form-control" rows={3} maxLength={450} value={form.resumo} onChange={mudar} placeholder="Por que essa receita é especial? Como você gosta de servi-la?"/><div className="form-text">Esse texto aparece logo abaixo da foto no feed.</div></div>
        <div className="col-sm-4"><label htmlFor="rc-porcoes" className="form-label">Rendimento (porções)</label><input id="rc-porcoes" type="number" name="porcoes" className="form-control" min="1" max="100" value={form.porcoes} onChange={mudar} required/></div>
        <div className="col-sm-4"><label htmlFor="rc-tempo" className="form-label">Tempo em minutos</label><input id="rc-tempo" name="tempoMin" type="number" min="1" max="1440" required className="form-control" value={form.tempoMin} onChange={mudar}/></div>
        <div className="col-sm-4"><label htmlFor="rc-dif" className="form-label">Dificuldade</label><select id="rc-dif" name="dificuldade" className="form-select" value={form.dificuldade} onChange={mudar}><option>Fácil</option><option>Médio</option><option>Difícil</option></select></div>
        <div className="col-12"><MidiaUploader imagemUrl={form.imagemUrl} videoUrl={form.videoUrl} onChange={(campo, url) => setForm(prev => ({ ...prev, [campo]: url }))} onBusyChange={setEnviandoMidia}/></div>
        <div className="col-12"><label htmlFor="rc-busca" className="form-label">Consultar alimento para os ingredientes</label><div className="input-group"><input id="rc-busca" className="form-control" value={buscaIngrediente} onChange={e => setBuscaIngrediente(e.target.value)} placeholder="Ex.: aveia, iogurte, banana"/><button type="button" className="btn btn-outline-success" disabled={buscandoIngrediente} onClick={pesquisarIngrediente}>Buscar</button></div>{opcoesIngrediente.length > 0 && <div className="list-group mt-2">{opcoesIngrediente.map((a,i) => <button type="button" className="list-group-item list-group-item-action" key={`${a.chave}-${i}`} onClick={() => inserirIngrediente(a.nome)}>{a.nome} <small className="text-success">· {a.fonte}</small><span className="float-end">+ Adicionar</span></button>)}</div>}</div>
        <div className="col-12"><label htmlFor="rc-ingredientes" className="form-label">Ingredientes — um por linha</label><textarea id="rc-ingredientes" name="ingredientes" className="form-control" rows={6} value={form.ingredientes} onChange={mudar} required placeholder={'2 bananas\n3 colheres de aveia\n1 xícara de leite'}/></div>
        <div className="col-12"><label htmlFor="rc-preparo" className="form-label">Modo de preparo</label><textarea id="rc-preparo" name="preparo" className="form-control" rows={7} minLength={15} value={form.preparo} onChange={mudar} required placeholder="Descreva as etapas..."/></div>
        <div className="col-12"><button type="submit" className="btn btn-success btn-lg px-4" disabled={salvando || enviandoMidia}>{salvando ? 'Publicando...' : editar ? 'Salvar alterações' : original ? 'Publicar minha versão' : 'Publicar receita'}</button></div>
      </form>
    </section>
  </main>
}
