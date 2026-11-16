/** Importação opcional SQLite -> MySQL, somente se o MySQL migrado estiver vazio.
 * Preserva os IDs, confere colunas e quantidades; NÃO elimina dados existentes.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Sequelize, QueryTypes } from 'sequelize'
import { sequelize as destino } from './models.js'

const arquivo = process.argv[2]
if (!arquivo || !fs.existsSync(arquivo)) {
  console.error('Uso: npm run db:import:sqlite -- "C:/caminho/nutriflow.sqlite"')
  process.exit(1)
}
const fonte = new Sequelize({ dialect: 'sqlite', storage: path.resolve(arquivo), logging: false })
const ordem = ['usuarios', 'alimentos', 'alimentos_salvos', 'receitas', 'receitas_salvas', 'publicacoes', 'comentarios', 'curtidas', 'seguidores', 'mensagens', 'denuncias']
let conn
try {
  await fonte.authenticate()
  await destino.authenticate()
  const origemTabelas = new Set((await fonte.getQueryInterface().showAllTables()).map(x => typeof x === 'string' ? x : x.tableName))
  const destinoTabelas = new Set((await destino.getQueryInterface().showAllTables()).map(x => typeof x === 'string' ? x : x.tableName))
  if (!destinoTabelas.has('_nutriflow_migrations') || ordem.some(t => !destinoTabelas.has(t))) throw new Error('Execute todas as 7 migrations MySQL antes da importação.')
  const tarefas = []
  for (const tabela of ordem) {
    if (!origemTabelas.has(tabela)) continue
    const origemCount = Number((await fonte.query(`SELECT COUNT(*) AS total FROM \"${tabela}\"`, { type: QueryTypes.SELECT }))[0].total)
    const [destRows] = await destino.query(`SELECT COUNT(*) AS total FROM \`${tabela}\``)
    const destinoCount = Number(destRows[0].total)
    if (Number(destinoCount) !== 0) throw new Error(`Destino ${tabela} já possui ${destinoCount} registros. Não será sobrescrito.`)
    const origemCols = Object.keys(await fonte.getQueryInterface().describeTable(tabela))
    const destinoCols = Object.keys(await destino.getQueryInterface().describeTable(tabela))
    const desconhecidas = origemCols.filter(c => !destinoCols.includes(c))
    if (desconhecidas.length) throw new Error(`Colunas de ${tabela} não existem no MySQL: ${desconhecidas.join(', ')}`)
    tarefas.push({ tabela, count: origemCount, cols: origemCols })
  }
  console.log('Tabelas conferidas:', tarefas.map(t => `${t.tabela}=${t.count}`).join('; '))
  // Uma única conexão de MySQL preserva FOREIGN_KEY_CHECKS por sessão.
  conn = await destino.connectionManager.getConnection()
  await destino.query('SET FOREIGN_KEY_CHECKS=0', { connection: conn })
  try {
    for (const { tabela, count, cols } of tarefas) {
      if (!count) continue
      const registros = await fonte.query(`SELECT * FROM \"${tabela}\" ORDER BY id`, { type: QueryTypes.SELECT })
      const nomes = cols.map(c => `\`${c}\``).join(',')
      const lugares = cols.map(() => '?').join(',')
      for (let i = 0; i < registros.length; i += 100) {
        const lote = registros.slice(i, i + 100)
        for (const registro of lote) {
          const valores = cols.map(c => registro[c])
          await destino.query(`INSERT INTO \`${tabela}\` (${nomes}) VALUES (${lugares})`, { replacements: valores, connection: conn })
        }
      }
      const [resultado] = await destino.query(`SELECT COUNT(*) AS total FROM \`${tabela}\``, { connection: conn })
      if (Number(resultado[0].total) !== count) throw new Error(`Quantidade divergente em ${tabela}`)
      console.log(`OK ${tabela}: ${count} registros`)
    }
  } finally {
    await destino.query('SET FOREIGN_KEY_CHECKS=1', { connection: conn })
  }
  console.log('Importação encerrada. Valide login, receitas, vínculos e referências a mídias antes de usar. A importação não copia arquivos de uploads.')
} catch (e) {
  console.error('IMPORTAÇÃO INTERROMPIDA:', e.message)
  console.error('Se houve erro após gravar registros, use um novo banco vazio e repita. Não apague a origem.')
  process.exitCode = 1
} finally {
  if (conn) await destino.connectionManager.releaseConnection(conn)
  await fonte.close(); await destino.close()
}
