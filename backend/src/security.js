import jwt from 'jsonwebtoken'

const chave = () => {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres.')
  return secret
}
export function gerarToken(id) { return jwt.sign({ sub: String(id) }, chave(), { expiresIn: '2h', issuer: 'nutriflow' }) }
export function definirCookie(res, token) {
  res.cookie('nf_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 2 * 60 * 60 * 1000, path: '/' })
}
export function limparCookie(res) {
  res.clearCookie('nf_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })
}
export function autenticar(req, res, next) {
  try {
    const token = req.cookies?.nf_token
    if (!token) return res.status(401).json({ erro: 'Faça login para continuar.' })
    req.usuarioId = Number(jwt.verify(token, chave(), { issuer: 'nutriflow' }).sub)
    if (!Number.isSafeInteger(req.usuarioId)) throw new Error('Token inválido')
    return next()
  } catch { return res.status(401).json({ erro: 'Sessão inválida ou expirada. Entre novamente.' }) }
}
export const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
