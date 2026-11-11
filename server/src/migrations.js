/** Gerenciador simples de migrations com registro em banco e execução transacional.
 * Não utiliza sequelize.sync/alter/force; preserva dados existentes.
 */
import { readdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { DataTypes } from 'sequelize'

const pasta = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations')
const tabela = '_nutriflow_migrations'
const principais = ['usuarios', 'publicacoes', 'comentarios', 'curtidas', 'seguidores']
const formatarTabela = (t) => typeof t === 'string' ? t : (t.tableName || t.name || String(t))

export async function listarMigracoes() {
  const arquivos = (await readdir(pasta)).filter(nome => /^\d{12}-[\w-]+\.js$/.test(nome)).sort()
  if (arquivos.length === 0) throw new Error('Nenhuma migration encontrada.')
  return arquivos
}

async function garantirRegistro(sequelize) {
  const q = sequelize.getQueryInterface()
  const existentes = (await q.showAllTables()).map(formatarTabela)
  if (!existentes.includes(tabela)) {
    // A primeira migration deve começar com um banco vazio OU com o esquema herdado completo.
    const existentesDaAplicacao = principais.filter(nome => existentes.includes(nome))
    if (existentesDaAplicacao.length > 0 && existentesDaAplicacao.length < principais.length) {
      throw new Error('Esquema parcial encontrado. Faça backup e revise tabelas antes de executar migrations.')
    }
    if (existentesDaAplicacao.length === principais.length) {
      const usuarios = await q.describeTable('usuarios')
      const posts = await q.describeTable('publicacoes')
      if (!usuarios.senha_hash || !usuarios.email || !posts.autor_id) {
        throw new Error('Esquema existente difere do NutriFlow. Não será marcado como migrado automaticamente.')
      }
    }
    await q.createTable(tabela, {
      name: { type: DataTypes.STRING(140), allowNull: false, primaryKey: true },
      applied_at: { type: DataTypes.DATE, allowNull: false },
    })
    if (existentesDaAplicacao.length === principais.length) {
      // Atualização segura da versão acadêmica anterior, que criava tabelas via sync().
      await sequelize.getQueryInterface().bulkInsert(tabela, [{ name: '202611100001-criar-tabelas.js', applied_at: new Date() }])
    }
  }
}

export async function statusMigracoes(sequelize) {
  await garantirRegistro(sequelize)
  const [registros] = await sequelize.query(`SELECT name FROM "${tabela}"`)
  const concluidas = new Set(registros.map(r => r.name))
  return (await listarMigracoes()).map(nome => ({ nome, status: concluidas.has(nome) ? 'aplicada' : 'pendente' }))
}

export async function executarMigracoes(sequelize) {
  const status = await statusMigracoes(sequelize)
  for (const item of status.filter(x => x.status === 'pendente')) {
    const modulo = await import(pathToFileURL(join(pasta, item.nome)).href)
    if (typeof modulo.up !== 'function') throw new Error(`Migration ${item.nome} não exporta up().`)
    await sequelize.transaction(async transaction => {
      await modulo.up(sequelize.getQueryInterface(), transaction)
      await sequelize.getQueryInterface().bulkInsert(tabela, [{ name: item.nome, applied_at: new Date() }], { transaction })
    })
  }
  return status.filter(x => x.status === 'pendente').map(x => x.nome)
}
