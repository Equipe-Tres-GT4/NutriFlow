import 'dotenv/config'
import process from 'node:process'
import app from './app.js'
import { initializeDatabase, pool } from './config/database.js'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET deve conter pelo menos 32 caracteres.')
}

const port = Number(process.env.PORT) || 3000

try {
  await initializeDatabase()
  const server = app.listen(port, () => {
    console.log(`NutriFlow API disponível em http://localhost:${port}`)
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await pool.end()
        process.exit(0)
      })
    })
  }
} catch (error) {
  console.error('Não foi possível iniciar a API:', error.message)
  await pool.end()
  process.exit(1)
}