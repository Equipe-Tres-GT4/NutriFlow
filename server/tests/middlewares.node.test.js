import test from 'node:test'
import assert from 'node:assert/strict'
import { origemDeEscritaPermitida } from '../src/middlewares.js'
const host = 'localhost:3001'
test('leituras sem efeito colateral passam independentemente da origem', () => {
  assert.equal(origemDeEscritaPermitida({ method: 'GET', headers: { origin: 'https://outro.tld', host } }), true)
})
test('escritas negam origem cruzada desconhecida', () => {
  assert.equal(origemDeEscritaPermitida({ method: 'POST', headers: { origin: 'https://malicioso.tld', host } }), false)
})
test('escritas aceitam frontend permitido e a mesma origem', () => {
  assert.equal(origemDeEscritaPermitida({ method: 'PATCH', headers: { origin: 'http://localhost:5173', host } }), true)
  assert.equal(origemDeEscritaPermitida({ method: 'DELETE', headers: { origin: 'http://localhost:3001', host } }), true)
})
