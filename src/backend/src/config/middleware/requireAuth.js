import process from 'node:process'
import jwt from 'jsonwebtoken'
import { pool } from '../database.js'

export async function requireAuth(req, res, next) {
  const token = req.cookies?.nutriflow_token
  if (!token) {
    return res.status(401).json({ error: 'Autenticação necessária.' })
  }

  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET)
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [sub],
    )

    if (!result.rowCount) {
      return res.status(401).json({ error: 'Sessão inválida.' })
    }

    req.user = result.rows[0]
    return next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    }
    return next(error)
  }
}