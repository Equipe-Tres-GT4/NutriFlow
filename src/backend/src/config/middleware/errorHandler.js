export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  console.error(error)
  return res.status(500).json({ error: 'Erro interno do servidor.' })
}