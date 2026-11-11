import { beforeAll, afterAll, describe, it, expect } from '@jest/globals'
import request from 'supertest'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'jest-test-demo-abcdef-1234567890'
process.env.DB_STORAGE = ':memory:'
const { sequelize, Usuario, Receita, Publicacao, Seguidor } = await import('../src/models.js')
const { popularDemo } = await import('../src/seed-demo.js')
const { default: app } = await import('../src/app.js')

beforeAll(async () => { await sequelize.authenticate(); await popularDemo() }, 30000)
afterAll(async () => { await sequelize.close() })

describe('Comunidade de demonstração: dados persistidos e filtros úteis', () => {
  it('cria cinco usuários fictícios, 25 receitas e publicações correspondentes', async () => {
    expect(await Usuario.count({ where: { isDemo: true } })).toBe(5)
    expect(await Receita.count()).toBe(25)
    expect(await Publicacao.count({ where: { tipo: 'receita' } })).toBe(25)
    expect(await Seguidor.count()).toBe(10)
    const r = await request(app).get('/api/community/authors')
    expect(r.status).toBe(200)
    expect(r.body.autores).toHaveLength(5)
    expect(r.body.autores.every(a => a.isDemo && a.totalReceitas === 5)).toBe(true)
  })
  it('não duplica conteúdo ao executar seed duas vezes', async () => {
    const resumo = await popularDemo()
    expect(resumo.novasPublicacoes).toBe(0)
    expect(resumo.novosUsuarios).toBe(0)
    expect(resumo.novosFavoritos).toBe(0)
    expect(resumo.novosSeguimentos).toBe(0)
    expect(await Receita.count()).toBe(25)
  }, 30000)
  it('busca por autor, ordena por receitas salvas e não expõe e-mails', async () => {
    const autores = (await request(app).get('/api/community/authors')).body.autores
    const autor = autores[0]
    const filtrado = await request(app).get(`/api/posts?autor=${autor.id}&tipo=receita`)
    expect(filtrado.status).toBe(200)
    expect(filtrado.body.total).toBe(5)
    expect(filtrado.body.publicacoes.every(p => p.autorId === autor.id)).toBe(true)
    const populares = await request(app).get('/api/posts?tipo=receita&sort=salvas')
    expect(populares.status).toBe(200)
    expect(populares.body.total).toBe(25)
    expect(populares.body.publicacoes[0].totalSalvos).toBeGreaterThanOrEqual(populares.body.publicacoes.at(-1).totalSalvos)
    expect(populares.body.publicacoes[0].autor.isDemo).toBe(true)
    expect(populares.body.publicacoes[0].autor.email).toBeUndefined()
  })
  it('usuário autenticado salva uma receita e visualiza apenas suas favoritas', async () => {
    const agente = request.agent(app)
    const cadastro = await agente.post('/api/auth/register').send({ nome: 'Usuário de teste', email: 'novo@example.com', senha: 'senhateste123' })
    expect(cadastro.status).toBe(201)
    const posts = (await agente.get('/api/posts?tipo=receita')).body.publicacoes
    const chave = `local:${posts[0].receitaId}`
    expect((await agente.post('/api/saved/recipes').send({ chave })).status).toBe(201)
    const filtrado = await agente.get('/api/posts?tipo=receita&salvas=minhas')
    expect(filtrado.status).toBe(200)
    expect(filtrado.body.total).toBe(1)
    expect(filtrado.body.publicacoes[0].salvo).toBe(true)
  })
})
