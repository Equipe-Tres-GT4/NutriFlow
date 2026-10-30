import process from 'node:process'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { pool } from './config/database.js'
import authRoutes from './config/routes/authRoutes.js'
import { errorHandler } from './config/middleware/errorHandler.js'

const app = express()
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: clientOrigin, credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1')
    return res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    return next(error)
  }
})

app.use('/api/auth', authRoutes)
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }))
app.use(errorHandler)

export default app