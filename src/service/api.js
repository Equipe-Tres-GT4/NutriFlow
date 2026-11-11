/** Cliente único: todas as integrações usam nosso backend /api (Vite proxy em desenvolvimento). */
export async function api(caminho, { method = 'GET', body, signal } = {}) {
  const resposta = await fetch(`/api${caminho}`, {
    method, credentials: 'include', signal,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  if (resposta.status === 204) return null
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(dados.erro || `Falha na API (HTTP ${resposta.status}).`)
  return dados
}

/** Envio autenticado de fotos e vídeos como bytes (sem base64 e sem dependências). */
export async function enviarMidia(file) {
  const resposta = await fetch('/api/media', { method: 'POST', credentials: 'include', headers: { 'Content-Type': file.type }, body: file })
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(dados.erro || `Falha no envio (HTTP ${resposta.status}).`)
  return dados
}
