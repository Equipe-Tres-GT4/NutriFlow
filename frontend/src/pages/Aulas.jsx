import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../service/api'

const rotulos = {
  integrado: { nome: 'Integrado', classe: 'bg-success-subtle text-success' },
  conceito_aproveitado: { nome: 'Conceito aproveitado', classe: 'bg-info-subtle text-info-emphasis' },
  sem_acesso: { nome: 'Código não verificado', classe: 'bg-warning-subtle text-warning-emphasis' },
}

export default function Aulas() {
  const [aulas, setAulas] = useState([])
  const [erro, setErro] = useState('')
  const [filtro, setFiltro] = useState('todos')
  useEffect(() => {
    let ativo = true
    api('/learning/sources')
      .then(r => { if (ativo) setAulas(r.repositorios) })
      .catch(e => { if (ativo) setErro(e.message) })
    return () => { ativo = false }
  }, [])
  const visiveis = filtro === 'todos' ? aulas : aulas.filter(a => a.estado === filtro)
  return <main className="container py-5">
    <div className="mb-4">
      <span className="badge bg-success-subtle text-success mb-2">Projeto final · Geração Tech</span>
      <h1 className="display-6 fw-bold text-success">Aulas e tecnologias aplicadas</h1>
      <p className="text-secondary" style={{ maxWidth: 850 }}>
        Esta área mostra quais conceitos demonstrados nos repositórios da turma foram incorporados ao NutriFlow.
        O código do professor não foi copiado cegamente: foram mantidas soluções já funcionais e adaptados recursos úteis para uma rede social de alimentos.
      </p>
      <div className="d-flex flex-wrap gap-2">
        <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success">Swagger da API</a>
        <Link to="/integracoes" className="btn btn-success">Experimentar APIs externas</Link>
        <Link to="/comunidade" className="btn btn-outline-secondary">Visitar comunidade</Link>
      </div>
    </div>
    <section className="card border-0 rounded-4 shadow-sm p-4 mb-4">
      <h2 className="h4 fw-bold">Como ler esta documentação</h2>
      <p className="mb-1"><strong>Integrado:</strong> implementação funcional ligada ao conteúdo público da aula.</p>
      <p className="mb-1"><strong>Conceito aproveitado:</strong> técnica presente no projeto, sem necessidade de repetir o exemplo.</p>
      <p className="mb-0"><strong>Código não verificado:</strong> a URL não disponibilizou o código publicamente durante a conferência; a correspondência é apenas temática.</p>
    </section>
    <div className="row align-items-center mb-3 gy-2">
      <div className="col-md"><h2 className="h4 fw-bold mb-0">Repositórios do professor ({aulas.length})</h2></div>
      <div className="col-md-auto"><label htmlFor="filtro-aulas" className="visually-hidden">Filtrar aplicações</label><select id="filtro-aulas" className="form-select" value={filtro} onChange={e => setFiltro(e.target.value)}><option value="todos">Mostrar todos</option><option value="integrado">Integrados</option><option value="conceito_aproveitado">Conceito aproveitado</option><option value="sem_acesso">Código não verificado</option></select></div>
    </div>
    {erro && <div role="alert" className="alert alert-danger">Não foi possível consultar o catálogo das aulas. Confira se a API está ligada: {erro}</div>}
    <div className="row g-3">{visiveis.map(aula => <div className="col-lg-6" key={aula.id}><article className="card h-100 rounded-4 border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2"><h3 className="h5 fw-bold text-success mb-0">{aula.id}</h3><span className={`badge ${rotulos[aula.estado]?.classe || 'bg-secondary-subtle'}`}>{rotulos[aula.estado]?.nome || aula.estado}</span></div>
      <p className="fw-semibold mb-2">{aula.tema}</p><p className="text-secondary small mb-3">{aula.aplicacao}</p>
      <div className="mt-auto"><p className="small mb-2"><strong>Onde conferir no projeto:</strong> {aula.arquivos.map((file,i) => <code className="d-inline-block me-2" key={i}>{file}</code>)}</p><a href={aula.url} target="_blank" rel="noopener noreferrer">Repositório original no GitHub</a></div>
    </article></div>)}</div>
    <p className="small text-secondary mt-4">A página documenta a implementação acadêmica; publicação em produção, políticas de APIs, privacidade e testes de implantação ainda exigem validação própria.</p>
  </main>
}
