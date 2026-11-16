import { beforeAll, afterAll, test, expect } from '@jest/globals'
import request from 'supertest'

process.env.DB_STORAGE = ':memory:'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'social-tests-exclusively-for-nutriflow-1234567'
const { sequelize } = await import('../src/models.js')
const { executarMigracoes } = await import('../src/migrations.js')
const { default: app } = await import('../src/app.js')
const ana = request.agent(app), bia = request.agent(app), caio = request.agent(app)
let anaId, biaId, caioId

beforeAll(async () => {
  await executarMigracoes(sequelize)
  const cadastrar = async (agente, nome, email) => {
    const r = await agente.post('/api/auth/register').send({ nome, email, senha: 'senhadeTeste123' })
    expect(r.status).toBe(201)
    return r.body.usuario.id
  }
  anaId = await cadastrar(ana, 'Ana Gomes', 'ana-social@example.com')
  biaId = await cadastrar(bia, 'Bia Oliveira', 'bia-social@example.com')
  caioId = await cadastrar(caio, 'Caio Lima', 'caio-social@example.com')
  for (const [agente, titulo] of [[ana, 'Salada de Ana'], [bia, 'Sopa de Bia'], [caio, 'Arroz de Caio']]) {
    expect((await agente.post('/api/posts').send({ titulo, conteudo: 'Receita e experiência nutritiva compartilhada na comunidade.', tipo: 'dica' })).status).toBe(201)
  }
})
afterAll(async () => { await sequelize.close() })

test('sem login não acessa feed social nem dados de conexões', async () => {
  expect((await request(app).get('/api/posts?feed=seguindo')).status).toBe(401)
  expect((await request(app).get('/api/social/summary')).status).toBe(401)
  expect((await request(app).get('/api/social/people')).status).toBe(401)
})

test('não é possível seguir a própria conta e filtros inválidos retornam 400', async () => {
  expect((await ana.put(`/api/users/${anaId}/follow`)).status).toBe(400)
  expect((await ana.get('/api/posts?feed=qualquer')).status).toBe(400)
  expect((await ana.get('/api/social/connections?tipo=invalido')).status).toBe(400)
})

test('feed Seguindo mostra só autor seguido; PUT e DELETE são idempotentes', async () => {
  const vazio = await ana.get('/api/posts?feed=seguindo')
  expect(vazio.status).toBe(200)
  expect(vazio.body.total).toBe(0)
  expect((await ana.put(`/api/users/${biaId}/follow`)).body.seguindo).toBe(true)
  expect((await ana.put(`/api/users/${biaId}/follow`)).body.seguidores).toBe(1)
  const seguindo = await ana.get('/api/posts?feed=seguindo')
  expect(seguindo.status).toBe(200)
  expect(seguindo.body.total).toBe(1)
  expect(seguindo.body.publicacoes[0].autorId).toBe(biaId)
  expect(seguindo.body.publicacoes[0].seguindoAutor).toBe(true)
  const pessoas = await ana.get('/api/social/connections?tipo=seguindo')
  expect(pessoas.body.total).toBe(1)
  expect(pessoas.body.pessoas[0].nome).toBe('Bia Oliveira')
  expect(pessoas.body.pessoas[0].email).toBeUndefined()
  expect((await ana.delete(`/api/users/${biaId}/follow`)).body.seguindo).toBe(false)
  expect((await ana.delete(`/api/users/${biaId}/follow`)).body.seguidores).toBe(0)
  expect((await ana.get('/api/posts?feed=seguindo')).body.total).toBe(0)
})

test('seguidores e amigos são distintos, e amizades exigem reciprocidade', async () => {
  await ana.put(`/api/users/${biaId}/follow`)
  await caio.put(`/api/users/${anaId}/follow`)
  expect((await ana.get('/api/social/summary')).body).toMatchObject({ seguindo: 1, seguidores: 1, amigos: 0 })
  expect((await ana.get('/api/social/connections?tipo=seguidores')).body.pessoas[0].id).toBe(caioId)
  expect((await ana.get('/api/posts?feed=amigos')).body.total).toBe(0)
  const feedSeguidores = await ana.get('/api/posts?feed=seguidores')
  expect(feedSeguidores.body.total).toBe(1)
  expect(feedSeguidores.body.publicacoes[0].autorId).toBe(caioId)
  expect((await bia.put(`/api/users/${anaId}/follow`)).body.amigos).toBe(true)
  expect((await ana.get('/api/social/summary')).body).toMatchObject({ seguindo: 1, seguidores: 2, amigos: 1 })
  const amigos = await ana.get('/api/social/connections?tipo=amigos')
  expect(amigos.body.total).toBe(1)
  expect(amigos.body.pessoas[0]).toMatchObject({ id: biaId, seguindo: true, meSegue: true, amigos: true })
  const feed = await ana.get('/api/posts?feed=amigos')
  expect(feed.body.total).toBe(1)
  expect(feed.body.publicacoes[0].autorId).toBe(biaId)
  expect((await ana.get(`/api/users/${biaId}`)).body).toMatchObject({ euSigo: true, meSegue: true, amigos: true })
})

test('descoberta busca por nome sem expor e-mails, CEP ou senhas', async () => {
  const r = await ana.get('/api/social/people?q=Bia')
  expect(r.status).toBe(200)
  expect(r.body.total).toBe(1)
  expect(r.body.pessoas[0].nome).toBe('Bia Oliveira')
  expect(r.body.pessoas[0].email).toBeUndefined()
  expect(r.body.pessoas[0].senhaHash).toBeUndefined()
  expect(r.body.pessoas[0].cep).toBeUndefined()
  expect((await ana.get('/api/openapi.json')).body.paths['/api/social/connections']).toBeTruthy()
})
