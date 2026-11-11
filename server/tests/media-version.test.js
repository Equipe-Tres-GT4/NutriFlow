import { beforeAll, afterAll, expect, test } from '@jest/globals'
import request from 'supertest'
process.env.DB_STORAGE = ':memory:'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'media-versao-teste-local-987654321-jwt'
const { sequelize, Receita } = await import('../src/models.js')
const { executarMigracoes } = await import('../src/migrations.js')
const { default: app } = await import('../src/app.js')
const agente = request.agent(app)
beforeAll(async () => { await executarMigracoes(sequelize) })
afterAll(async () => { await sequelize.close() })

test('upload de imagem exige autenticação', async () => {
  const r = await request(app).post('/api/media').set('Content-Type','image/png').send(Buffer.from([137,80,78,71,13,10,26,10,1]))
  expect(r.status).toBe(401)
})
test('receitas têm versão com vínculo e comentários independentes', async () => {
  const login = await agente.post('/api/auth/register').send({ nome:'Fotógrafa', email:'foto@example.com', senha:'Minhasenha123' })
  expect(login.status).toBe(201)
  const corpo = { nome:'Tigela de verduras', ingredientes:['1 tomate','2 folhas de alface'], preparo:'Lave, pique e misture os ingredientes com azeite.', dificuldade:'Fácil', tempoMin:12 }
  const original = await agente.post('/api/recipes').send(corpo)
  expect(original.status).toBe(201)
  const id = Number(original.body.receita.id.slice(6))
  const versao = await agente.post('/api/recipes').send({ ...corpo, nome:'Tigela de verduras versão 2', receitaOriginalId:id })
  expect(versao.status).toBe(201)
  const versoes = await agente.get(`/api/recipes/${id}/versions`)
  expect(versoes.status).toBe(200)
  expect(versoes.body.versoes).toHaveLength(1)
  expect(versoes.body.versoes[0].receitaOriginalId).toBe(id)
  const post = await agente.get(`/api/recipes/${id}/post`)
  expect(post.status).toBe(200)
  expect((await agente.post(`/api/posts/${post.body.postId}/comments`).send({ texto:'Gostei muito!' })).status).toBe(201)
  expect((await agente.get(`/api/posts/${post.body.postId}/comments`)).body.comentarios).toHaveLength(1)
  expect(await Receita.count()).toBe(2)
  expect((await agente.get('/api/openapi.json')).body.paths['/api/media']).toBeTruthy()
})
