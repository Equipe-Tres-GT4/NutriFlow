import { beforeAll, afterAll, test, expect } from '@jest/globals'
import request from 'supertest'

process.env.DB_STORAGE = ':memory:'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'nutriflow-testes-moderacao-senha-longa-2026!'
const { sequelize, Usuario, Mensagem, Denuncia } = await import('../src/models.js')
const { executarMigracoes } = await import('../src/migrations.js')
const { default: app } = await import('../src/app.js')
const alice = request.agent(app), bob = request.agent(app), carol = request.agent(app), adm = request.agent(app)
let aliceId, bobId, adminId, receitaId, postId
const corpoReceita = { nome: 'Torta de legumes', resumo: 'Receita feita com legumes', ingredientes: ['2 cenouras', '1 abobrinha'], preparo: 'Pique os legumes e asse a torta até ficar dourada.', tempoMin: 35, porcoes: 4, dificuldade: 'Fácil' }

beforeAll(async () => {
  await executarMigracoes(sequelize)
  async function cadastrar(agent, nome, email) {
    const r = await agent.post('/api/auth/register').send({ nome, email, senha: 'SenhaTesteSegura2026!' })
    expect(r.status).toBe(201)
    return r.body.usuario.id
  }
  aliceId = await cadastrar(alice, 'Alice autora', 'alice@example.com')
  bobId = await cadastrar(bob, 'Bob denunciante', 'bob@example.com')
  await cadastrar(carol, 'Carol participante', 'carol@example.com')
  adminId = await cadastrar(adm, 'Administrador do teste', 'admin@example.com')
  await Usuario.update({ papel: 'admin' }, { where: { id: adminId } })
  const r = await alice.post('/api/recipes').send(corpoReceita)
  expect(r.status).toBe(201)
  receitaId = Number(r.body.receita.id.slice(6))
  postId = (await alice.get(`/api/recipes/${receitaId}/post`)).body.postId
})
afterAll(async () => { await sequelize.close() })

test('não permite acesso ao painel por usuários comuns e não permite denunciar a própria receita', async () => {
  expect((await bob.get('/api/admin/reports')).status).toBe(403)
  expect((await request(app).get('/api/admin/reports')).status).toBe(401)
  expect((await alice.post('/api/reports').send({ tipoAlvo: 'publicacao', alvoId: postId, motivo: 'spam' })).status).toBe(400)
  expect((await bob.post('/api/reports').send({ tipoAlvo: 'publicacao', alvoId: postId, motivo: 'motivo-invalido' })).status).toBe(400)
})

test('denúncia é privada, duplicação é bloqueada e moderadores veem a fila', async () => {
  const r = await bob.post('/api/reports').send({ tipoAlvo: 'publicacao', alvoId: postId, motivo: 'nao_e_receita', detalhes: 'Esta publicação não tem os ingredientes necessários.' })
  expect(r.status).toBe(201)
  expect((await bob.post('/api/reports').send({ tipoAlvo: 'publicacao', alvoId: postId, motivo: 'spam' })).status).toBe(409)
  const minha = await bob.get('/api/reports/mine')
  expect(minha.body.denuncias).toHaveLength(1)
  expect(minha.body.denuncias[0].status).toBe('pendente')
  const fila = await adm.get('/api/admin/reports')
  expect(fila.status).toBe(200)
  expect(fila.body.pendentes).toBe(1)
  expect(fila.body.denuncias[0].denunciante.nome).toBe('Bob denunciante')
  expect(fila.body.denuncias[0].autorAlvo.nome).toBe('Alice autora')
})

test('chat é privado, permite texto e compartilhamento de receita; terceiro não tem acesso', async () => {
  expect((await bob.post('/api/messages').send({ destinatarioId: bobId, texto: 'Olá' })).status).toBe(400)
  const envio = await bob.post('/api/messages').send({ destinatarioId: aliceId, texto: 'Gostei da combinação!' })
  expect(envio.status).toBe(201)
  const partilha = await bob.post('/api/messages').send({ destinatarioId: aliceId, receitaId, texto: 'Veja esta receita' })
  expect(partilha.status).toBe(201)
  expect(partilha.body.mensagem.tipo).toBe('receita')
  const conversaAlice = await alice.get(`/api/messages/${bobId}`)
  expect(conversaAlice.status).toBe(200)
  expect(conversaAlice.body.mensagens).toHaveLength(2)
  expect(conversaAlice.body.mensagens[1].tituloReceita).toBe('Torta de legumes')
  const conversaCarol = await carol.get(`/api/messages/${bobId}`)
  expect(conversaCarol.status).toBe(200)
  expect(conversaCarol.body.mensagens).toHaveLength(0)
  expect((await alice.get('/api/messages/unread')).body.naoLidas).toBe(0)
})

test('administrador pode manter conteúdo e envia feedback a autor e denunciante por DM', async () => {
  const id = (await adm.get('/api/admin/reports')).body.denuncias[0].id
  const r = await adm.post(`/api/admin/reports/${id}/review`).send({ acao: 'manter', observacao: 'A receita está dentro das diretrizes e contém modo de preparo.' })
  expect(r.status).toBe(200)
  expect(r.body.status).toBe('mantida')
  expect((await adm.post(`/api/admin/reports/${id}/review`).send({ acao:'manter', observacao: 'Esta já foi analisada.' })).status).toBe(409)
  const paraBob = await bob.get(`/api/messages/${adminId}`)
  const paraAlice = await alice.get(`/api/messages/${adminId}`)
  expect(paraBob.body.mensagens.some(m => m.tipo === 'moderacao')).toBe(true)
  expect(paraAlice.body.mensagens.some(m => m.tipo === 'moderacao')).toBe(true)
  expect((await alice.get(`/api/posts/${postId}`)).status).toBe(200)
})

test('equipe remove receita denunciada, preserva registro e impede apagar receita de outro autor', async () => {
  const outra = await alice.post('/api/recipes').send({ ...corpoReceita, nome: 'Torta de cenoura assada' })
  const novaId = Number(outra.body.receita.id.slice(6))
  const novoPostId = (await alice.get(`/api/recipes/${novaId}/post`)).body.postId
  expect((await bob.delete(`/api/recipes/${novaId}`)).status).toBe(403)
  expect((await bob.post('/api/reports').send({ tipoAlvo:'publicacao', alvoId:novoPostId, motivo:'conteudo_improprio' })).status).toBe(201)
  expect((await carol.post('/api/reports').send({ tipoAlvo:'publicacao', alvoId:novoPostId, motivo:'spam' })).status).toBe(201)
  const denuncia = await Denuncia.findOne({ where: { tipoAlvo:'publicacao', alvoId:novoPostId, denuncianteId:bobId } })
  const r = await adm.post(`/api/admin/reports/${denuncia.id}/review`).send({ acao:'remover', observacao:'O conteúdo não cumpre as normas de publicação da comunidade.' })
  expect(r.status).toBe(200)
  expect((await alice.get(`/api/recipes/local:${novaId}`)).status).toBe(404)
  expect((await alice.get(`/api/posts/${novoPostId}`)).status).toBe(404)
  expect((await Denuncia.findByPk(denuncia.id)).status).toBe('removida')
  const respostas = await Mensagem.count({ where: { tipo:'moderacao', remetenteId:adminId } })
  expect(respostas).toBe(5)
  expect((await carol.get(`/api/messages/${adminId}`)).body.mensagens.some(m => m.tipo === 'moderacao')).toBe(true)
})

test('receita própria pode ser excluída sem excluir versão feita por outro usuário', async () => {
  const versao = await bob.post('/api/recipes').send({ ...corpoReceita, nome:'Minha versão da torta', receitaOriginalId:receitaId })
  expect(versao.status).toBe(201)
  const minhaVersao = Number(versao.body.receita.id.slice(6))
  expect((await alice.delete(`/api/recipes/${receitaId}`)).status).toBe(204)
  const consulta = await bob.get(`/api/recipes/local:${minhaVersao}`)
  expect(consulta.status).toBe(200)
  expect(consulta.body.receita.receitaOriginalId).toBeNull()
})

test('reclamação de perfil permite orientação via chat, sem permitir exclusão automática de conta', async () => {
  const envio = await carol.post('/api/reports').send({ tipoAlvo:'usuario', alvoId:aliceId, motivo:'assedio', detalhes:'Recebi uma mensagem desagradável deste perfil.' })
  expect(envio.status).toBe(201)
  const id = envio.body.denuncia.id
  expect((await adm.post(`/api/admin/reports/${id}/review`).send({ acao:'remover', observacao:'A conta será suspensa agora.' })).status).toBe(400)
  const r = await adm.post(`/api/admin/reports/${id}/review`).send({ acao:'orientar', observacao:'Recomendamos respeito e diálogo nas mensagens da comunidade.' })
  expect(r.status).toBe(200)
  expect(r.body.status).toBe('orientada')
  expect((await Usuario.findByPk(aliceId)).id).toBe(aliceId)
  expect((await carol.get('/api/reports/mine')).body.denuncias[0].status).toBe('orientada')
  const conversa = await alice.get(`/api/messages/${adminId}`)
  expect(conversa.body.mensagens.some(m => m.texto.includes('Recomendamos respeito'))).toBe(true)
})
