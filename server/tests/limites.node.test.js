import test from 'node:test'
import assert from 'node:assert/strict'
import { limiteGeral, limiteAutenticacao, ignorarLimiteAutenticacao } from '../src/limites.js'

const tempLinux = '/tmp/nutriflow-e2e-a1b2/nutriflow-cypress.sqlite'
const tempWindows = 'C:\\Users\\tester\\AppData\\Local\\Temp\\nutriflow-e2e-a1b2\\nutriflow-cypress.sqlite'

const opt = (storage, nodeEnv = 'test', mode = '1') => ({
  NODE_ENV: nodeEnv,
  NUTRIFLOW_E2E_ISOLADO: mode,
  DB_STORAGE: storage,
})

test('limite normal fica em 30 em desenvolvimento e produção', () => {
  assert.equal(limiteAutenticacao({}), 30)
  assert.equal(limiteAutenticacao(opt(tempLinux, 'development')), 30)
  assert.equal(limiteAutenticacao(opt(tempLinux, 'production')), 30)
})

test('ambiente Cypress isolado aceita somente SQLite temporário', () => {
  assert.equal(limiteAutenticacao(opt(tempLinux)), 150)
  assert.equal(limiteAutenticacao(opt(tempWindows)), 150)
})

test('banco principal nunca recebe limite especial mesmo com flag de testes', () => {
  assert.equal(limiteAutenticacao(opt('/projeto/server/data/nutriflow.sqlite')), 30)
  assert.equal(limiteAutenticacao(opt('C:\\projeto\\server\\data\\nutriflow.sqlite')), 30)
  assert.equal(limiteAutenticacao(opt(tempLinux, 'test', '0')), 30)
})

test('consultas de sessão e logout não gastam cota de login e cadastro', () => {
  assert.equal(ignorarLimiteAutenticacao({ method: 'GET', path: '/me' }), true)
  assert.equal(ignorarLimiteAutenticacao({ method: 'POST', path: '/logout' }), true)
  assert.equal(ignorarLimiteAutenticacao({ method: 'POST', path: '/login' }), false)
  assert.equal(ignorarLimiteAutenticacao({ method: 'POST', path: '/register' }), false)
})


test('limitador geral permite testes Cypress e preserva 120/min no site real', () => {
  assert.equal(limiteGeral({}), 120)
  assert.equal(limiteGeral(opt(tempLinux, 'development')), 120)
  assert.equal(limiteGeral(opt(tempLinux, 'production')), 120)
  assert.equal(limiteGeral(opt(tempLinux)), 600)
  assert.equal(limiteGeral(opt(tempWindows)), 600)
  assert.equal(limiteGeral(opt('/projeto/server/data/nutriflow.sqlite')), 120)
  assert.equal(limiteGeral(opt(tempLinux, 'test', '0')), 120)
})
