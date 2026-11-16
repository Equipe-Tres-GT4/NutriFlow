/** Upload local autenticado de fotos/vídeos para a comunidade acadêmica.
 * Aceita bytes binários diretamente, valida assinatura e usa UUID como nome.
 * Sem dependências adicionais. Para produção: armazenamento externo/CDN e antivírus.
 */
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import express from 'express'
import { autenticar, asyncRoute } from './security.js'

const pasta = resolve(process.env.MEDIA_STORAGE || 'uploads')
const formatos = {
  'image/jpeg': { ext: 'jpg', max: 8_000_000, ok: b => b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', max: 8_000_000, ok: b => b.length > 8 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) },
  'image/webp': { ext: 'webp', max: 8_000_000, ok: b => b.length > 12 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP' },
  'video/mp4': { ext: 'mp4', max: 25_000_000, ok: b => b.length > 12 && b.toString('ascii',4,8)==='ftyp' },
  'video/webm': { ext: 'webm', max: 25_000_000, ok: b => b.length > 4 && b.subarray(0,4).equals(Buffer.from([26,69,223,163])) },
}
export function reconhecerMidia(tipo, bytes) {
  const f = formatos[tipo]
  return f && Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= f.max && f.ok(bytes) ? f.ext : null
}
export function registrarMidia(app) {
  app.post('/api/media', autenticar, express.raw({ type: () => true, limit: '26mb' }), asyncRoute(async (req, res) => {
    const tipo = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
    const ext = reconhecerMidia(tipo, req.body)
    if (!ext) return res.status(400).json({ erro: 'Arquivo inválido. Aceitamos fotos JPG/PNG/WebP até 8 MB ou vídeos MP4/WebM até 25 MB.' })
    const nome = `${randomUUID()}.${ext}`
    await mkdir(pasta, { recursive: true })
    await writeFile(resolve(pasta, nome), req.body, { flag: 'wx', mode: 0o600 })
    res.status(201).json({ url: `/api/media/${nome}`, tipo: ext === 'mp4' || ext === 'webm' ? 'video' : 'imagem' })
  }))
  app.get('/api/media/:nome', (req, res) => {
    if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp|mp4|webm)$/.test(req.params.nome)) return res.status(404).end()
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    return res.sendFile(req.params.nome, { root: pasta }, erro => { if (erro && !res.headersSent) res.status(404).end() })
  })
}
