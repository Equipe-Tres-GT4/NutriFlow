import { beforeAll, afterAll, describe, it, expect } from '@jest/globals'
process.env.NODE_ENV = 'test'
process.env.DB_STORAGE = ':memory:'
const { sequelize, Usuario, Publicacao } = await import('../src/models.js')
const { executarMigracoes, statusMigracoes } = await import('../src/migrations.js')

beforeAll(async () => { await sequelize.authenticate() })
afterAll(async () => { await sequelize.close() })

describe('Migrations do Sequelize', () => {
  it('cria o esquema inicial e relacionamentos sem sequelize.sync()', async () => {
    const aplicadas = await executarMigracoes(sequelize)
    expect(aplicadas).toContain('202611100001-criar-tabelas.js')
    const tables = await sequelize.getQueryInterface().showAllTables()
    for (const nome of ['usuarios', 'publicacoes', 'comentarios', 'curtidas', 'seguidores', 'alimentos', 'receitas', 'alimentos_salvos', 'receitas_salvas']) {
      expect(tables).toContain(nome)
    }
    const usuario = await Usuario.create({ nome: 'Teste', email: 'teste@exemplo.com', senhaHash: 'hash-qualquer' })
    const post = await Publicacao.create({ titulo: 'Receita caseira', conteudo: 'Uma receita suficientemente longa.', autorId: usuario.id })
    expect(post.autorId).toBe(usuario.id)
  })
  it('não recria as tabelas ao executar duas vezes', async () => {
    expect(await executarMigracoes(sequelize)).toHaveLength(0)
    expect((await statusMigracoes(sequelize))[0].status).toBe('aplicada')
    expect(await Publicacao.count()).toBe(1)
  })
})
