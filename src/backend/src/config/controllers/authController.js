import process from 'node:process'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../database.js'

const emailValido = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api',
  maxAge: 24 * 60 * 60 * 1000,
}

const usuarioPublico = ({ id, name, email, created_at }) => ({
  id,
  nome: name,
  email,
  criadoEm: created_at,
})

export async function register(req, res, next) {
  const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const senha = typeof req.body.senha === 'string' ? req.body.senha : ''

  if (!nome || nome.length > 120) {
    return res.status(400).json({ error: 'Informe um nome com até 120 caracteres.' })
  }
  if (email.length > 254 || !emailValido.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' })
  }
  if (senha.length < 6 || senha.length > 72) {
    return res.status(400).json({ error: 'A senha deve ter entre 6 e 72 caracteres.' })
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 12)
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [nome, email, senhaHash],
    )

    return res.status(201).json({ usuario: usuarioPublico(result.rows[0]) })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' })
    }
    return next(error)
  }
}

export async function login(req, res, next) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const senha = typeof req.body.senha === 'string' ? req.body.senha : ''

  if (!emailValido.test(email) || !senha) {
    return res.status(400).json({ error: 'Informe um e-mail e uma senha válidos.' })
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
      [email],
    )
    const usuario = result.rows[0]

    if (!usuario || !(await bcrypt.compare(senha, usuario.password_hash))) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: String(usuario.id),
      expiresIn: '1d',
    })
    res.cookie('nutriflow_token', token, cookieOptions)
    return res.json({ usuario: usuarioPublico(usuario) })
  } catch (error) {
    return next(error)
  }
}

export function currentUser(req, res) {
  return res.json({ usuario: usuarioPublico(req.user) })
}

export function logout(req, res) {
  res.clearCookie('nutriflow_token', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  })
  return res.status(204).end()
}