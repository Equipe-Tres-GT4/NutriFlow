import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'
import MidiaUploader from '../components/MidiaUploader'

const campos = ['calorias100g', 'proteinas100g', 'carboidratos100g', 'gorduras100g']
const legendas = ['Calorias (kcal)', 'Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)']
const inicial = { nome: '', marca: '', codigoBarras: '', imagemUrl: '', calorias100g: '', proteinas100g: '', carboidratos100g: '', gorduras100g: '' }
function Info({ rotulo, valor, unidade = 'g' }) { return <div className="d-flex justify-content-between gap-2 border-bottom py-1 small"><span className="text-secondary">{rotulo}</span><strong>{valor === null || valor === undefined ? 'Não informado' : `${valor} ${unidade}`}</strong></div> }
export default function Alimentos() {
  const { usuario } = useAuth()
  const [q, setQ] = useState(''), [alimentos, setAlimentos] = useState([]), [aviso, setAviso] = useState(''), [erro, setErro] = useState(''), [ocupado, setOcupado] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false), [editandoId,setEditandoId] = useState(null), [form, setForm] = useState(inicial), [salvos, setSalvos] = useState([]), [salvando, setSalvando] = useState('')
  const carregarSalvos = () => usuario ? api('/saved/foods').then(r=>setSalvos(r.alimentos)).catch(()=>{}) : Promise.resolve()
  async function buscar(termo = q) {
    setOcupado(true); setErro(''); setAviso('')
    try { const r = await api(`/foods?q=${encodeURIComponent(termo.trim())}`); setAlimentos(r.alimentos); setAviso(r.aviso || '') }
    catch(e) { setErro(e.message) } finally { setOcupado(false) }
  }
  useEffect(() => { api('/foods').then(r=>setAlimentos(r.alimentos)).catch(e=>setErro(e.message)); if(usuario) api('/saved/foods').then(r=>setSalvos(r.alimentos)).catch(()=>{}) }, [usuario])
  async function favoritar(a) {
    if (!usuario) return setErro('Entre na sua conta para salvar alimentos.')
    setSalvando(a.chave); setErro('')
    try { const ja = salvos.some(s=>s.chave===a.chave); await api(`/saved/foods${ja?`/${encodeURIComponent(a.chave)}`:''}`, { method: ja?'DELETE':'POST', ...(ja?{}:{body:{chave:a.chave}}) }); await carregarSalvos() } catch(e){setErro(e.message)} finally{setSalvando('')}
  }
  async function criar(e) {
    e.preventDefault(); setErro('')
    try { await api(editandoId?`/foods/${editandoId}`:'/foods', { method: editandoId?'PUT':'POST', body: form }); setForm(inicial); setEditandoId(null); setMostrarForm(false); await buscar('') }
    catch(e){setErro(e.message)}
  }
  function editar(a) { setEditandoId(a.id); setForm(Object.fromEntries(Object.keys(inicial).map(k => [k, a[k] ?? '']))); setMostrarForm(true); window.scrollTo({top:0,behavior:'smooth'}) }
  async function excluir(a) {
    if (!window.confirm('Excluir este alimento cadastrado?')) return
    try { await api(`/foods/${a.id}`, { method: 'DELETE' }); await buscar(q) } catch(e){setErro(e.message)}
  }
  return <main className="container py-5">
    <div className="row align-items-end g-4 mb-4"><div className="col-lg-8"><span className="text-success small fw-bold">CONSULTA ALIMENTAR</span><h1 className="fw-bold mt-2" style={{color:'#184d32'}}>Conheça melhor seus alimentos</h1><p className="text-secondary">Pesquise pelo nome ou código de barras. Compare rótulos reais com alimentos cadastrados pela comunidade.</p></div><div className="col-lg-4 text-lg-end">{usuario ? <button className="btn btn-outline-success" onClick={()=>{setEditandoId(null);setForm(inicial);setMostrarForm(x=>!x)}}><i className="bi bi-plus-circle me-2"/>Cadastrar alimento</button> : <Link to="/cadastro" className="btn btn-outline-success">Crie uma conta para contribuir</Link>}</div></div>
    <form className="input-group mb-3 shadow-sm" onSubmit={e=>{e.preventDefault();buscar()}}><label htmlFor="busca-alimentos" className="visually-hidden">Nome ou código de barras</label><input id="busca-alimentos" className="form-control form-control-lg" placeholder="Ex.: aveia, iogurte ou 3017620422003" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn btn-success px-4" disabled={ocupado}>{ocupado?'Buscando...':'Pesquisar'}</button></form>
    <p className="small text-secondary mb-4">Dados de produtos industrializados: Open Food Facts. A qualidade das informações depende dos colaboradores; confira sempre a embalagem. Informações por 100 g ou 100 ml.</p>
    {erro && <div className="alert alert-danger" role="alert">{erro}</div>}{aviso && <div className="alert alert-warning" role="status">{aviso}</div>}
    {mostrarForm && <section className="card rounded-4 shadow-sm border-0 p-4 mb-4" aria-label="Cadastrar novo alimento"><h2 className="h4">{editandoId?'Corrigir alimento cadastrado':'Adicionar alimento à comunidade'}</h2><p className="text-secondary small">Informe dados que você conferiu na embalagem, sem inventar valores.</p><form onSubmit={criar} className="row g-3"><div className="col-md-6"><label className="form-label">Nome do alimento</label><input className="form-control" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></div><div className="col-md-6"><label className="form-label">Marca (opcional)</label><input className="form-control" value={form.marca} onChange={e=>setForm({...form,marca:e.target.value})}/></div><div className="col-md-6"><label className="form-label">Código de barras (opcional)</label><input className="form-control" inputMode="numeric" value={form.codigoBarras} onChange={e=>setForm({...form,codigoBarras:e.target.value})}/></div><div className="col-12"><MidiaUploader somenteFoto imagemUrl={form.imagemUrl} onChange={(campo, url) => setForm(prev => ({ ...prev, [campo]: url }))}/></div>{campos.map((c,i)=><div className="col-6 col-md-3" key={c}><label className="form-label">{legendas[i]}</label><input type="number" min="0" step="0.01" className="form-control" value={form[c]} onChange={e=>setForm({...form,[c]:e.target.value})}/></div>)}<div className="col-12"><button className="btn btn-success">{editandoId?'Salvar correções':'Publicar alimento'}</button></div></form></section>}
    {alimentos.length === 0 ? <div className="rounded-4 p-5 bg-white text-center text-secondary">{q ? 'Nenhum resultado por enquanto. Confira o termo ou tente outro alimento.' : 'Pesquise um produto ou seja a primeira pessoa a cadastrar um alimento.'}</div> : <div className="row g-4">{alimentos.map((a,i)=><div className="col-sm-6 col-xl-4" key={`${a.chave}-${i}`}><article className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden">
      {a.imagem ? <img src={a.imagem} className="w-100" style={{height:170,objectFit:'contain',background:'#f4f7f3'}} loading="lazy" alt={a.nome}/> : <div className="d-flex align-items-center justify-content-center bg-success-subtle text-success" style={{height:130}}><i className="bi bi-egg-fried fs-1"/></div>}
      <div className="card-body d-flex flex-column"><span className="text-success small fw-semibold">{a.fonte}</span><h2 className="h5 fw-bold mt-1">{a.nome}</h2><p className="text-secondary small mb-2">{a.marca || a.autor?.nome || 'Alimento da comunidade'}{a.codigo ? ` · ${a.codigo}` : ''}</p>
        <div className="bg-light rounded-3 p-3 mb-3"><Info rotulo="Energia" valor={a.calorias100g} unidade="kcal"/><Info rotulo="Proteínas" valor={a.proteinas100g}/><Info rotulo="Carboidratos" valor={a.carboidratos100g}/><Info rotulo="Gorduras" valor={a.gorduras100g}/></div>
        <div className="mt-auto d-flex flex-wrap gap-2"><button type="button" className="btn btn-outline-success btn-sm" disabled={salvando===a.chave} onClick={()=>favoritar(a)}><i className={`bi ${salvos.some(s=>s.chave===a.chave)?'bi-bookmark-fill':'bi-bookmark'} me-1`}/>{salvos.some(s=>s.chave===a.chave)?'Salvo':'Salvar'}</button>{usuario&&<Link className="btn btn-outline-secondary btn-sm" to={`/receitas/cadastrar?ingrediente=${encodeURIComponent(a.nome)}`}>Usar em receita</Link>}{a.autor?.id===usuario?.id && <><button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>editar(a)}>Editar</button><button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>excluir(a)}>Excluir</button></>}</div>
      </div></article></div>)}</div>}
  </main>
}
