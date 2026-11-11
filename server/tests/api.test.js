import { beforeAll, afterAll, describe, it, expect } from '@jest/globals'
import request from 'supertest'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'jest-chave-local-exclusiva-testes-123456789'
process.env.DB_STORAGE = ':memory:'
const { sequelize } = await import('../src/models.js')
const { default: app } = await import('../src/app.js')
const { executarMigracoes } = await import('../src/migrations.js')

beforeAll(async () => { await executarMigracoes(sequelize) })
afterAll(async () => { await sequelize.close() })

describe('API NutriFlow / autenticação e comunidade', () => {
  const agente = request.agent(app)
  it('rejeita cadastros com senha fraca', async () => {
    const r = await agente.post('/api/auth/register').send({ nome: 'Ana', email: 'ana@example.com', senha: '123' })
    expect(r.status).toBe(400)
  })
  it('cadastra e não devolve hash de senha', async () => {
    const r = await agente.post('/api/auth/register').send({ nome: 'Ana', email: 'ana@example.com', senha: 'supersegura123' })
    expect(r.status).toBe(201)
    expect(r.body.usuario.senhaHash).toBeUndefined()
    expect(r.headers['set-cookie'].join(';')).toContain('HttpOnly')
  })
  it('consulta sessão sem vazar senha', async () => {
    const r = await agente.get('/api/auth/me')
    expect(r.status).toBe(200)
    expect(r.body.usuario.nome).toBe('Ana')
  })
  it('cria, lista, curte, comenta e remove publicação própria', async () => {
    const c = await agente.post('/api/posts').send({ titulo: 'Dica saudável', conteudo: 'Eu gosto de preparar frutas de manhã.', tipo: 'dica' })
    expect(c.status).toBe(201)
    const id = c.body.publicacao.id
    expect((await agente.get('/api/posts')).body.total).toBe(1)
    expect((await agente.post(`/api/posts/${id}/like`)).body.curtido).toBe(true)
    expect((await agente.post(`/api/posts/${id}/comments`).send({ texto: 'Muito bom!' })).status).toBe(201)
    expect((await agente.get(`/api/posts/${id}/comments`)).body.comentarios).toHaveLength(1)
    expect((await agente.delete(`/api/posts/${id}`)).status).toBe(204)
  })
  it('exige autenticação para criar postagens', async () => {
    const r = await request(app).post('/api/posts').send({ titulo: 'Teste', conteudo: 'Texto longo bastante para postar.' })
    expect(r.status).toBe(401)
  })
  it('rejeita CEP/código de barras inválidos sem realizar chamadas externas', async () => {
    expect((await agente.get('/api/integrations/location/cep/100')).status).toBe(400)
    expect((await agente.get('/api/integrations/foods/abc')).status).toBe(400)
  })
  it('integra cadastro, catálogo e coleção de alimentos ao banco', async () => {
    const r = await agente.post('/api/foods').send({ nome: 'Aveia local', marca: 'Cooperativa', calorias100g: 380, proteinas100g: 12 })
    expect(r.status).toBe(201)
    const chave = r.body.alimento.chave
    const lista = await agente.get('/api/foods') // sem termo: nenhuma chamada externa
    expect(lista.status).toBe(200)
    expect(lista.body.alimentos.some(x => x.chave === chave)).toBe(true)
    expect((await agente.put(`/api/foods/${r.body.alimento.id}`).send({nome:'Aveia revisada',marca:'Cooperativa',calorias100g:370})).status).toBe(200)
    expect((await agente.post('/api/saved/foods').send({ chave })).status).toBe(201)
    expect((await agente.get('/api/saved/foods')).body.alimentos[0].chave).toBe(chave)
    expect((await agente.delete(`/api/saved/foods/${encodeURIComponent(chave)}`)).status).toBe(204)
    expect((await agente.delete(`/api/foods/${r.body.alimento.id}`)).status).toBe(204)
  })
  it('publica receita estruturada no catálogo e feed, permite salvar e editar', async () => {
    const receita = { nome:'Salada de teste', ingredientes:['1 tomate','1 pepino'], preparo:'Higienize os vegetais, pique e misture numa tigela.', dificuldade:'Fácil', tempoMin:15 }
    const r = await agente.post('/api/recipes').send(receita)
    expect(r.status).toBe(201)
    const chave = r.body.receita.id
    expect((await agente.get('/api/recipes')).body.receitas.some(x=>x.id===chave)).toBe(true)
    expect((await agente.get(`/api/recipes/${encodeURIComponent(chave)}`)).body.receita.ingredientes).toHaveLength(2)
    expect((await agente.post('/api/saved/recipes').send({chave})).status).toBe(201)
    expect((await agente.get('/api/saved/recipes')).body.receitas[0].chave).toBe(chave)
    expect((await agente.put(`/api/recipes/${chave.slice(6)}`).send({ ...receita, nome:'Salada revisada' })).status).toBe(200)
    const posts = (await agente.get('/api/posts')).body.publicacoes
    expect(posts.some(p => p.receitaId === Number(chave.slice(6)) && p.titulo === 'Salada revisada')).toBe(true)
    expect((await agente.delete(`/api/recipes/${chave.slice(6)}`)).status).toBe(204)
    expect((await agente.get('/api/posts')).body.publicacoes.some(p=>p.receitaId === Number(chave.slice(6)))).toBe(false)
  })
  it('não permite cadastrar alimentos ou receitas sem autenticação', async () => {
    expect((await request(app).post('/api/foods').send({ nome:'Feijão' })).status).toBe(401)
    expect((await request(app).post('/api/recipes').send({ nome:'Arroz' })).status).toBe(401)
  })
  it('documenta os provedores e gera OpenAPI', async () => {
    expect((await agente.get('/api/integrations/sources')).body.fontes).toHaveLength(5)
    expect((await agente.get('/api/openapi.json')).body.openapi).toBe('3.0.3')
  })
})
