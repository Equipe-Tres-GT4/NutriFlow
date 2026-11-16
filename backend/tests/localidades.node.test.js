import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { ESTADOS_BRASIL } from '../src/localidades.js'
import { listarEstadosComFonte, listarCidadesComFonte } from '../src/external.js'

const buscarOriginal = globalThis.fetch
const driverOriginal = process.env.NF_HTTP_DRIVER
process.env.NF_HTTP_DRIVER = 'fetch'
globalThis.fetch = async () => { throw new Error('Simular IBGE indisponível') }
after(() => {
  globalThis.fetch = buscarOriginal
  if (driverOriginal === undefined) delete process.env.NF_HTTP_DRIVER
  else process.env.NF_HTTP_DRIVER = driverOriginal
})

test('IBGE indisponível: cadastro recebe 27 UFs com códigos válidos, inclusive Ceará', async () => {
  const r = await listarEstadosComFonte()
  assert.equal(r.modoReserva, true)
  assert.equal(r.estados.length, 27)
  assert.equal(ESTADOS_BRASIL.length, 27)
  assert.equal(r.estados.find(x => x.sigla === 'CE').nome, 'Ceará')
})

test('IBGE indisponível: município continua manual em vez de bloquear o formulário', async () => {
  const r = await listarCidadesComFonte('CE')
  assert.equal(r.modoManual, true)
  assert.deepEqual(r.cidades, [])
})
