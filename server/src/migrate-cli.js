import 'dotenv/config'
import { sequelize } from './models.js'
import { executarMigracoes, statusMigracoes } from './migrations.js'

try {
  await sequelize.authenticate()
  if (process.argv.includes('--status')) {
    const status = await statusMigracoes(sequelize)
    for (const { nome, status: estado } of status) console.log(`${estado.toUpperCase()}  ${nome}`)
  } else {
    const aplicadas = await executarMigracoes(sequelize)
    console.log(aplicadas.length ? `Migrations aplicadas: ${aplicadas.join(', ')}` : 'Banco atualizado: nenhuma migration pendente.')
  }
} catch (error) {
  console.error('Falha na migração:', error.message)
  process.exitCode = 1
} finally { await sequelize.close() }
