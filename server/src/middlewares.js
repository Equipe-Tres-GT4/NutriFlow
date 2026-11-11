/** Middleware Express: valida a origem das operações que alteram dados e
 * padroniza as respostas de erros. Complementa CORS e SameSite=Lax.
 */
export function origemDeEscritaPermitida(req, origens = process.env.CORS_ORIGIN || 'http://localhost:5173') {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true
  const origin = req.headers.origin
  if (!origin) return true // clientes sem navegador (curl, Swagger, testes)
  const lista = origens.split(',').map(s => s.trim()).filter(Boolean)
  try { return lista.includes(origin) || new URL(origin).host === req.headers.host }
  catch { return false }
}

export function verificarOrigem(req, res, next) {
  if (!origemDeEscritaPermitida(req)) return res.status(403).json({ erro: 'Origem não permitida.' })
  next()
}

export function tratarErro(err, _req, res, _next) {
  if (process.env.NODE_ENV !== 'production') console.error('[API]', err.message)
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ erro: 'Já existe um registro com esses dados.' })
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'Conteúdo acima do limite permitido.' })
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500
  return res.status(status).json({ erro: status === 500 ? 'Erro interno. Tente novamente.' : err.message })
}
