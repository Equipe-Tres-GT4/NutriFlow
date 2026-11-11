import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { Link } from 'react-router-dom'
import { api, enviarMidia } from '../service/api'
import { useLocalidades } from '../hooks/useLocalidades'

const campos = ['nome','telefone','cep','logradouro','numero','bairro','cidade','uf','peso','altura','objetivo','restricoes','fotoUrl']
export default function Perfil() {
  const { usuario, atualizarPerfil } = useAuth()
  const [social, setSocial] = useState({ seguindo: 0, seguidores: 0, amigos: 0 })
  useEffect(() => { api('/social/summary').then(setSocial).catch(() => {}) }, [])
  const [form, setForm] = useState(() => Object.fromEntries(campos.map(k => [k, k === 'uf' ? String(usuario?.[k] || '').toUpperCase() : usuario?.[k] || ''])))
  const { estados, cidades, carregandoEstados, carregandoCidades, avisoEstados, avisoCidades, tentarNovamente } = useLocalidades(form.uf)
  const [mensagem, setMensagem] = useState(''), [erro, setErro] = useState(''), [carregandoCep, setCarregandoCep] = useState(false), [salvando, setSalvando] = useState(false), [subindoFoto, setSubindoFoto] = useState(false)
  const mudar = e => { setMensagem(''); setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }
  async function buscarCep() {
    if (!/^\d{8}$/.test(form.cep.replace(/\D/g, ''))) { setErro('Digite um CEP válido de 8 números.'); return }
    setErro(''); setCarregandoCep(true)
    try {
      const { endereco } = await api(`/integrations/location/cep/${encodeURIComponent(form.cep)}`)
      setForm(prev => ({ ...prev, cep: endereco.cep, cidade: endereco.cidade, uf: String(endereco.uf || '').toUpperCase(), bairro: endereco.bairro, logradouro: endereco.logradouro }))
      setMensagem(`Endereço preenchido usando ${endereco.fonte}. Confira antes de salvar.`)
    } catch (e) { setErro(e.message) } finally { setCarregandoCep(false) }
  }
  async function trocarFoto(file) {
    if (!file) return
    setSubindoFoto(true); setErro(''); setMensagem('')
    try {
      if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem JPG, PNG ou WebP.')
      const midia = await enviarMidia(file)
      setForm(prev => ({ ...prev, fotoUrl: midia.url }))
      setMensagem('Foto enviada. Clique em Salvar perfil para atualizar sua conta.')
    } catch (e) { setErro(e.message) }
    finally { setSubindoFoto(false) }
  }
  async function salvar(e) {
    e.preventDefault(); setSalvando(true); setErro(''); setMensagem('')
    try { const salvo = await atualizarPerfil(form); setForm(Object.fromEntries(campos.map(k => [k, k === 'uf' ? String(salvo?.[k] || '').toUpperCase() : salvo?.[k] || '']))); setMensagem('Perfil salvo no banco de dados com sucesso.') }
    catch (e) { setErro(e.message) } finally { setSalvando(false) }
  }
  if (!usuario) return null
  return <main className="container py-5" style={{ maxWidth: 850 }}><div className="card rounded-4 shadow-sm border-0 p-4 p-md-5">
    <h1 className="h3 fw-bold text-success">Meu perfil</h1><p className="text-secondary small">Dados guardados com proteção de acesso no backend. Seu e-mail e endereço não aparecem no perfil público.</p>
    <p className="text-muted border-bottom pb-3">{usuario.nome} · {usuario.email}</p>
    <div className="d-flex gap-2 flex-wrap mb-3"><Link to="/mensagens" className="btn btn-outline-success btn-sm"><i className="bi bi-chat"/> Mensagens</Link><Link to="/minhas-denuncias" className="btn btn-outline-secondary btn-sm"><i className="bi bi-flag"/> Minhas denúncias</Link><a href="/conexoes?aba=seguidores" className="btn btn-outline-success btn-sm">{social.seguidores} seguidores</a><a href="/conexoes?aba=seguindo" className="btn btn-outline-success btn-sm">{social.seguindo} seguindo</a><a href="/conexoes?aba=amigos" className="btn btn-outline-success btn-sm">{social.amigos} amigos</a></div>
    {erro && <div role="alert" className="alert alert-danger">{erro}</div>}{mensagem && <div role="status" className="alert alert-success">{mensagem}</div>}
    <form onSubmit={salvar} className="row g-3">
      <div className="col-12"><div className="d-flex gap-3 align-items-center mb-2"><img src={form.fotoUrl || '/favicon.png'} alt="Foto atual do perfil" width="82" height="82" style={{objectFit:'cover',borderRadius:'50%',border:'2px solid #d5e8d6'}}/><div><label htmlFor="perfil-foto" className="form-label fw-semibold">Sua foto de perfil</label><input id="perfil-foto" type="file" accept="image/jpeg,image/png,image/webp" className="form-control" onChange={e => trocarFoto(e.target.files?.[0])} disabled={subindoFoto}/><small className="text-secondary">{subindoFoto ? 'Enviando foto...' : 'Foto exibida junto às suas receitas e comentários.'}</small></div></div></div>
      <div className="col-md-7"><label className="form-label" htmlFor="perfil-nome">Nome</label><input id="perfil-nome" name="nome" className="form-control" value={form.nome} onChange={mudar} required maxLength={100}/></div>
      <div className="col-md-5"><label className="form-label" htmlFor="perfil-telefone">Telefone (opcional)</label><input id="perfil-telefone" name="telefone" className="form-control" value={form.telefone} onChange={mudar} maxLength={30}/></div>
      <div className="col-md-5"><label className="form-label" htmlFor="perfil-cep">CEP</label><div className="input-group"><input id="perfil-cep" name="cep" className="form-control" inputMode="numeric" placeholder="60000-000" value={form.cep} onChange={mudar}/><button type="button" className="btn btn-outline-success" onClick={buscarCep} disabled={carregandoCep}>{carregandoCep ? 'Buscando...' : 'Buscar CEP'}</button></div></div>
      <div className="col-md-7"><label className="form-label" htmlFor="perfil-logradouro">Logradouro</label><input id="perfil-logradouro" name="logradouro" className="form-control" value={form.logradouro} onChange={mudar} maxLength={160}/></div>
      <div className="col-md-3"><label className="form-label" htmlFor="perfil-numero">Número</label><input id="perfil-numero" name="numero" className="form-control" value={form.numero} onChange={mudar} maxLength={20}/></div>
      <div className="col-md-4"><label className="form-label" htmlFor="perfil-bairro">Bairro</label><input id="perfil-bairro" name="bairro" className="form-control" value={form.bairro} onChange={mudar} maxLength={120}/></div>
      <div className="col-md-5"><label className="form-label" htmlFor="perfil-uf">Estado (IBGE)</label><select id="perfil-uf" name="uf" className="form-select" value={form.uf} onChange={e => setForm(prev => ({ ...prev, uf: e.target.value, cidade: '' }))}><option value="">{carregandoEstados ? "Carregando estados..." : "Escolher UF"}</option>{estados.map(uf => <option key={uf.id} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>)}</select>{avisoEstados && <div className="form-text" role="status">{avisoEstados}{!estados.length && <button type="button" className="btn btn-link btn-sm py-0" onClick={tentarNovamente}>Tentar novamente</button>}</div>}</div>
      <div className="col-md-6"><label className="form-label" htmlFor="perfil-cidade">Município</label><input id="perfil-cidade" name="cidade" className="form-control" list="lista-cidades" value={form.cidade} onChange={mudar} placeholder="Cidade" maxLength={120}/><datalist id="lista-cidades">{cidades.map(c => <option key={c.id} value={c.nome}/>)}</datalist>{form.uf && <div className="form-text" role="status">{carregandoCidades ? "Consultando municípios..." : avisoCidades || (cidades.length ? `${cidades.length} municípios disponíveis para seleção.` : "Digite sua cidade.")}</div>}</div>
      <div className="col-md-3"><label className="form-label" htmlFor="perfil-peso">Peso (kg, opcional)</label><input id="perfil-peso" name="peso" type="number" step="0.1" min="0" className="form-control" value={form.peso} onChange={mudar}/></div>
      <div className="col-md-3"><label className="form-label" htmlFor="perfil-altura">Altura (cm, opcional)</label><input id="perfil-altura" name="altura" type="number" min="0" className="form-control" value={form.altura} onChange={mudar}/></div>
      <div className="col-md-6"><label className="form-label" htmlFor="perfil-objetivo">Objetivo</label><select id="perfil-objetivo" name="objetivo" value={form.objetivo} onChange={mudar} className="form-select"><option value="">Não informar</option>{['Perda de Peso','Ganho de Massa Muscular','Manutenção de Peso','Saúde e Longevidade'].map(x => <option key={x} value={x}>{x}</option>)}</select></div>
      <div className="col-12"><label className="form-label" htmlFor="perfil-restricoes">Restrições alimentares (opcional)</label><input id="perfil-restricoes" name="restricoes" className="form-control" value={form.restricoes} maxLength={255} onChange={mudar}/><small className="text-muted">Informação privada. Não compartilhe dados médicos desnecessários.</small></div>
      <div className="col-12"><button className="btn btn-success px-4" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar perfil'}</button></div>
    </form>
  </div></main>
}
