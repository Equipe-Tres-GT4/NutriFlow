import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../service/api'
import './Integracoes.css'

function Painel({ children, titulo, subtitulo, icon }) {
  return <section className="card border-0 shadow-sm rounded-4 p-4 h-100"><h2 className="h4 fw-bold text-success"><i className={`bi ${icon} me-2`}/>{titulo}</h2><p className="text-secondary small">{subtitulo}</p>{children}</section>
}
function Aviso({ mensagem }) { return mensagem ? <div role="alert" className="alert alert-warning mt-3">{mensagem}</div> : null }
function Produtos({ usuario }) {
  const [tipo, setTipo] = useState('codigo'), [consulta, setConsulta] = useState(''), [produtos, setProdutos] = useState([]), [erro, setErro] = useState(''), [mensagem,setMensagem] = useState(''), [carregando, setCarregando] = useState(false)
  async function buscar(e) {
    e.preventDefault(); setErro(''); setCarregando(true); setProdutos([])
    try {
      const d = tipo === 'codigo' ? await api(`/integrations/foods/${encodeURIComponent(consulta.replace(/\D/g,''))}`) : await api(`/integrations/foods/search?q=${encodeURIComponent(consulta.trim())}`)
      setProdutos(tipo === 'codigo' ? [d.produto] : d.produtos)
    } catch (err) { setErro(err.message) } finally { setCarregando(false) }
  }
  async function compartilhar(p) {
    setErro(''); setMensagem('')
    try {
      await api('/posts', { method: 'POST', body: {
        titulo: `Produto: ${p.nome}`.slice(0,140), tipo: 'dica',
        conteudo: `Produto consultado no Open Food Facts: ${p.nome} (${p.marca || 'marca não informada'}).\nCalorias: ${p.calorias100g ?? 'não informado'} kcal, proteínas: ${p.proteinas100g ?? 'não informado'} g, carboidratos: ${p.carboidratos100g ?? 'não informado'} g por 100 g/100 ml.\nDados colaborativos; conferir rótulo. Fonte: Open Food Facts.`,
        imagemUrl: /^https?:\/\//.test(p.imagem || '') && p.imagem.length <= 500 ? p.imagem : '',
      } })
      setMensagem('Produto compartilhado no feed!')
    } catch (e) { setErro(e.message) }
  }
  return <Painel titulo="Produtos e rótulos" subtitulo="Open Food Facts • Dados nutricionais e ingredientes de produtos industrializados, por 100 g ou 100 ml." icon="bi-upc-scan">
    <div className="d-flex gap-3 mb-2"><label><input type="radio" checked={tipo === 'codigo'} onChange={() => { setTipo('codigo'); setProdutos([]) }}/> Código de barras</label><label><input type="radio" checked={tipo === 'termo'} onChange={() => { setTipo('termo'); setProdutos([]) }}/> Nome do produto</label></div>
    <form className="d-flex gap-2" onSubmit={buscar}><input aria-label="Pesquisar produtos" className="form-control" value={consulta} onChange={e => setConsulta(e.target.value)} placeholder={tipo === 'codigo' ? 'Ex.: 3017620422003' : 'Ex.: granola'} required minLength={tipo === 'codigo' ? 8 : 2}/><button className="btn btn-success" disabled={carregando}>{carregando ? 'Consultando...' : 'Consultar'}</button></form>
    <Aviso mensagem={erro}/>
    {mensagem && <div className="alert alert-success mt-2">{mensagem} <Link to="/comunidade">Ver publicação</Link></div>}
    {produtos.length === 0 && !erro && !carregando && consulta && <p className="small text-secondary mt-3">A consulta pode não encontrar o produto desejado.</p>}
    <div className="nf-api-results mt-3">{produtos.map((p,i) => <div className="d-flex gap-3 border-top py-3" key={p.codigo || i}>{p.imagem && <img src={p.imagem} width="80" height="85" alt={p.nome} className="rounded object-fit-contain" loading="lazy"/>}<div><h3 className="h6 fw-bold">{p.nome}</h3><div className="small text-secondary">{p.marca} {p.codigo ? `• ${p.codigo}` : ''}</div><div className="small"><strong>Calorias:</strong> {p.calorias100g ?? 'Não informado'} kcal • <strong>Proteínas:</strong> {p.proteinas100g ?? 'Não informado'} g • <strong>Carboidratos:</strong> {p.carboidratos100g ?? 'Não informado'} g</div><p className="small mb-1"><strong>Ingredientes:</strong> {p.ingredientes || 'Não informados'}</p><small className="text-success">Fonte: {p.fonte} · valores por 100 g/100 ml</small>{usuario && <div className="mt-2"><button type="button" className="btn btn-outline-success btn-sm" onClick={() => compartilhar(p)}>Compartilhar no feed</button></div>}</div></div>)}</div>
    <p className="small text-secondary mt-3 mb-0">Dados colaborativos: confira sempre a embalagem. Não são orientações médicas.</p>
  </Painel>
}
function ReceitasExternas({ usuario }) {
  const [q,setQ] = useState(''), [receitas,setReceitas] = useState([]), [selecionada,setSelecionada] = useState(null), [erro,setErro] = useState(''), [mensagem,setMensagem] = useState(''), [ocupado,setOcupado] = useState(false)
  async function buscar(e) { e.preventDefault(); setErro(''); setOcupado(true); setSelecionada(null); try { const r = await api(`/integrations/recipes/search?q=${encodeURIComponent(q)}`); setReceitas(r.receitas) } catch (err) { setErro(err.message) } finally { setOcupado(false) } }
  async function aleatoria() { setErro(''); setOcupado(true); try { const r = await api('/integrations/recipes/random'); setSelecionada(r.receita); setReceitas(r.receita ? [r.receita] : []) } catch (err) { setErro(err.message) } finally { setOcupado(false) } }
  async function ver(id) { setErro(''); try { const r = await api(`/integrations/recipes/${id}`); setSelecionada(r.receita) } catch (err) { setErro(err.message) } }
  async function compartilhar(r) {
    setErro(''); setMensagem('')
    try {
      await api('/posts', { method: 'POST', body: {
        titulo: `Receita: ${r.nome}`.slice(0,140), tipo: 'receita',
        conteudo: `Receita importada da TheMealDB (conteúdo original em inglês).\n\nIngredientes:\n${r.ingredientes.map(i => `${i.medida} ${i.nome}`).join('\n')}\n\nPreparo:\n${r.preparo}`.slice(0,5000),
        imagemUrl: /^https?:\/\//.test(r.imagem || '') && r.imagem.length <= 500 ? r.imagem : '',
      } })
      setMensagem('Receita compartilhada na comunidade!')
    } catch (e) { setErro(e.message) }
  }
  return <Painel titulo="Receitas do mundo" subtitulo="TheMealDB • Receitas internacionais, ingredientes, preparo e foto. O catálogo costuma estar em inglês." icon="bi-journal-richtext">
    <form onSubmit={buscar} className="d-flex gap-2"><input aria-label="Pesquisar receitas internacionais" className="form-control" placeholder="Busque em inglês: chicken, rice, soup..." value={q} onChange={e => setQ(e.target.value)} minLength={2} required/><button className="btn btn-success" disabled={ocupado}>Buscar</button></form>
    <button type="button" className="btn btn-link align-self-start px-0" onClick={aleatoria} disabled={ocupado}>Surpreenda-me com uma receita</button>
    <Aviso mensagem={erro}/>
    {mensagem && <div className="alert alert-success mt-2">{mensagem} <Link to="/comunidade">Ver publicação</Link></div>}
    <div className="nf-api-results">
      {receitas.length === 0 && !erro && q && !ocupado && <p className="small text-muted">Sem resultados. Pesquise outro termo em inglês.</p>}
      {receitas.map(r => <button type="button" key={r.id} className="nf-api-recipe d-flex align-items-center gap-3 border-0 border-bottom bg-white w-100 text-start py-2" onClick={() => ver(r.id)}>{r.imagem && <img src={r.imagem} alt="" width="64" height="64" className="rounded object-fit-cover" loading="lazy"/>}<span><strong>{r.nome}</strong><small className="d-block text-muted">{r.categoria} • {r.pais} · {r.fonte}</small></span></button>)}
    </div>
    {selecionada && <div className="bg-light rounded-3 p-3 mt-3"><h3 className="h5">{selecionada.nome}</h3><p className="small text-secondary">Fonte: {selecionada.fonte} · Conteúdo original em inglês</p><strong>Ingredientes</strong><ul>{selecionada.ingredientes.map((ing,i) => <li key={i}>{ing.medida} {ing.nome}</li>)}</ul><strong>Modo de preparo</strong><p className="nf-preparo small mt-2">{selecionada.preparo}</p>{selecionada.video && <a href={selecionada.video} target="_blank" rel="noopener noreferrer">Vídeo da receita (fonte externa)</a>}{usuario && <div className="mt-3"><button className="btn btn-outline-success btn-sm" onClick={() => compartilhar(selecionada)} type="button">Compartilhar receita no feed</button></div>}</div>}
  </Painel>
}
function Cep() {
  const [cep,setCep] = useState(''), [endereco,setEndereco] = useState(null), [erro,setErro] = useState(''), [ocupado,setOcupado] = useState(false)
  async function buscar(e) { e.preventDefault(); setOcupado(true); setErro(''); setEndereco(null); try { const r = await api(`/integrations/location/cep/${encodeURIComponent(cep)}`); setEndereco(r.endereco) } catch (err) { setErro(err.message) } finally { setOcupado(false) } }
  return <Painel titulo="Consultar CEP" subtitulo="ViaCEP com fallback BrasilAPI • Preenchimento de cidade, bairro e logradouro sem armazenar dados da pesquisa." icon="bi-geo-alt">
    <form onSubmit={buscar} className="d-flex gap-2"><input aria-label="CEP" className="form-control" inputMode="numeric" placeholder="60000-000" value={cep} onChange={e => setCep(e.target.value)} required/><button className="btn btn-success" disabled={ocupado}>{ocupado ? 'Consultando...' : 'Buscar'}</button></form>
    <Aviso mensagem={erro}/>{endereco && <dl className="row mt-3 mb-0"><dt className="col-4">CEP</dt><dd className="col-8">{endereco.cep}</dd><dt className="col-4">Endereço</dt><dd className="col-8">{endereco.logradouro || 'Não informado'}</dd><dt className="col-4">Bairro</dt><dd className="col-8">{endereco.bairro || 'Não informado'}</dd><dt className="col-4">Cidade / UF</dt><dd className="col-8">{endereco.cidade} / {endereco.uf}</dd><dt className="col-4">Fonte</dt><dd className="col-8 text-success">{endereco.fonte}</dd></dl>}
  </Painel>
}
function Municipios() {
  const [estados,setEstados] = useState([]), [uf,setUf] = useState(''), [cidades,setCidades] = useState([]), [erro,setErro] = useState(''), [ocupado,setOcupado] = useState(false)
  useEffect(() => { api('/integrations/location/states').then(d => setEstados(d.estados)).catch(e => setErro(e.message)) }, [])
  async function selecionar(ufSelecionada) { setUf(ufSelecionada); setCidades([]); setErro(''); if (!ufSelecionada) return; setOcupado(true); try { const d = await api(`/integrations/location/states/${ufSelecionada}/cities`); setCidades(d.cidades) } catch (e) { setErro(e.message) } finally { setOcupado(false) } }
  return <Painel titulo="Estados e municípios" subtitulo="API oficial do IBGE • Códigos oficiais para localização e organização dos perfis." icon="bi-map">
    <label className="form-label" htmlFor="uf-ibge">Selecione uma UF</label><select id="uf-ibge" className="form-select" value={uf} onChange={e => selecionar(e.target.value)}><option value="">Escolha o estado</option>{estados.map(estado => <option key={estado.id} value={estado.sigla}>{estado.nome} ({estado.sigla})</option>)}</select>
    <Aviso mensagem={erro}/>{ocupado && <p className="small text-muted mt-2">Carregando municípios...</p>}
    {cidades.length > 0 && <><p className="small text-secondary mt-3">{cidades.length} municípios encontrados em {uf}. Exibindo os primeiros 20:</p><div className="nf-api-results list-group">{cidades.slice(0, 20).map(c => <div key={c.id} className="list-group-item d-flex justify-content-between"><span>{c.nome}</span><small className="text-muted">IBGE: {c.id}</small></div>)}</div></>}
  </Painel>
}
export default function Integracoes() {
  const { usuario } = useAuth()
  const [fontes,setFontes] = useState([]), [erro,setErro] = useState('')
  useEffect(() => { api('/integrations/sources').then(r => setFontes(r.fontes)).catch(e => setErro(e.message)) }, [])
  return <main className="container py-5"><div className="text-center mb-5"><span className="badge bg-success-subtle text-success mb-2">Dados com fonte identificada</span><h1 className="display-6 fw-bold text-success">Explorar APIs do NutriFlow</h1><p className="text-secondary mx-auto" style={{ maxWidth: 800 }}>Integrações reais de alimentos, receitas e localidades. Todas as requisições passam pelo backend, onde há validação, cache, padronização e tratamento de erros.</p><Link className="btn btn-success me-2" to="/aulas">Ver conteúdos das aulas</Link><a className="btn btn-outline-success" href="/api/docs" target="_blank" rel="noopener noreferrer"><i className="bi bi-file-earmark-code me-2"/>Abrir Swagger da nossa API</a></div>
    <div className="row g-4 mb-5"><div className="col-lg-6"><Produtos usuario={usuario}/></div><div className="col-lg-6"><ReceitasExternas usuario={usuario}/></div><div className="col-lg-6"><Cep/></div><div className="col-lg-6"><Municipios/></div></div>
    <section className="card rounded-4 border-0 shadow-sm p-4" aria-label="Documentação dos fornecedores"><h2 className="h4 fw-bold mb-3">Provedores e documentação oficial</h2><p className="text-secondary small">Cada resultado aponta sua fonte. Consulte as condições de uso antes de publicar o NutriFlow fora do ambiente acadêmico.</p><Aviso mensagem={erro}/><div className="table-responsive"><table className="table table-striped align-middle"><thead><tr><th>API</th><th>O que faz</th><th>Uso e limites</th><th>Documentação</th></tr></thead><tbody>{fontes.map(f => <tr key={f.id}><td className="fw-bold">{f.nome}</td><td>{f.finalidade}</td><td><small>{f.licenca}<br/>{f.limite}</small></td><td><a href={f.documento} target="_blank" rel="noopener noreferrer">Site oficial</a></td></tr>)}</tbody></table></div></section>
  </main>
}
