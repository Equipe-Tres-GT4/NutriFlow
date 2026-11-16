import test from 'node:test'
import assert from 'node:assert/strict'
import { ClienteHttp } from '../src/httpClient.js'

test('cliente POO centraliza status, dados e timeout via driver de testes', async () => {
  const original = globalThis.fetch
  let tempoRecebido = false
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://exemplo.test/objeto')
    tempoRecebido = Boolean(options.signal)
    return { status: 200, json: async () => ({ resultado: 42 }) }
  }
  try {
    const cliente = new ClienteHttp({ timeout: 200, driver: 'fetch' })
    assert.deepEqual(await cliente.getJson('https://exemplo.test/objeto'), { status: 200, data: { resultado: 42 } })
    assert.equal(tempoRecebido, true)
  } finally { globalThis.fetch = original }
})
