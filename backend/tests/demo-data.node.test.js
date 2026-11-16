import test from 'node:test'
import assert from 'node:assert/strict'
import { perfisDemo } from '../src/demo-content.js'

test('cinco perfis fictícios com necessidades alimentares distintas', () => {
  assert.equal(perfisDemo.length, 5)
  assert.equal(new Set(perfisDemo.map(p => p.objetivo)).size, 5)
  assert.ok(perfisDemo.every(p => p.email.endsWith('.invalid')))
})
test('25 receitas diferentes, com preparo e ingredientes úteis', () => {
  const receitas = perfisDemo.flatMap(p => p.receitas)
  assert.equal(receitas.length, 25)
  assert.equal(new Set(receitas.map(r => r.nome)).size, 25)
  assert.ok(perfisDemo.every(p => p.receitas.length === 5))
  for (const receita of receitas) {
    assert.ok(receita.ingredientes.length >= 4)
    assert.ok(receita.preparo.length > 65)
    assert.ok(receita.resumo.length > 20)
    assert.ok(receita.tempoMin >= 5)
  }
})
