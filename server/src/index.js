import 'dotenv/config'
import app from './app.js'
import { sequelize } from './models.js'
import { executarMigracoes } from './migrations.js'

const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERRO: defina JWT_SECRET de 32+ caracteres em server/.env (copie .env.example).')
  process.exit(1)
}
try {
  await sequelize.authenticate()
  await executarMigracoes(sequelize) // estrutura versionada; nunca sync({ force: true }) em dados reais
  const server = app.listen(port, host, () => console.log(`NutriFlow API http://${host === '0.0.0.0' ? 'localhost' : host}:${port} | Swagger /api/docs`))
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`ERRO: porta ${port} já está sendo usada. Feche o backend antigo antes de iniciar outro.`)
    } else {
      console.error('Falha ao iniciar servidor HTTP:', error)
    }
    process.exit(1)
  })
} catch (err) { console.error('Não foi possível iniciar a API:', err); process.exit(1) }
