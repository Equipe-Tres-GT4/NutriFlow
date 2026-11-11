import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { produtoPorCodigo, buscarProdutos, buscarReceitas, receitaPorId, receitaAleatoria, enderecoPorCep, listarEstados, listarCidades } from '../src/external.js'

process.env.NF_HTTP_DRIVER = 'fetch'
const antigoFetch = globalThis.fetch
const requisicoes = []
const json = (obj, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => obj })
globalThis.fetch = async (url) => {
  const u = String(url); requisicoes.push(u)
  if (u.includes('/api/v3/product/')) return json({ product: { code: '3017620422003', product_name: 'Produto teste', nutriments: { 'energy-kcal_100g': 550 } } })
  if (u.includes('/cgi/search.pl')) return json({ products: [{ code: '123', product_name: 'Aveia' }] })
  if (u.includes('search.php?s=')) return json({ meals: [{ idMeal: '52772', strMeal: 'Chicken soup', strIngredient1: 'Chicken', strMeasure1: '300 g' }] })
  if (u.includes('lookup.php?i=')) return json({ meals: [{ idMeal: '52772', strMeal: 'Soup' }] })
  if (u.includes('random.php')) return json({ meals: [{ idMeal: '1', strMeal: 'Surpresa' }] })
  if (u.includes('viacep.com.br')) throw new Error('Simular indisponibilidade ViaCEP')
  if (u.includes('brasilapi.com.br')) return json({ cep: '01001000', street: 'Praça da Sé', neighborhood: 'Sé', city: 'São Paulo', state: 'SP' })
  if (u.includes('/estados?')) return json([{ id: 23, sigla: 'CE', nome: 'Ceará' }])
  if (u.includes('/estados/CE/municipios')) return json([{ id: 2304400, nome: 'Fortaleza' }])
  throw new Error('URL não prevista: ' + u)
}
after(() => { globalThis.fetch = antigoFetch })

test('Open Food Facts busca e detalhamento com atribuição', async () => {
  const p = await produtoPorCodigo('3017620422003')
  assert.equal(p.calorias100g, 550)
  assert.equal(p.fonte, 'Open Food Facts')
  assert.equal((await buscarProdutos('aveia'))[0].nome, 'Aveia')
})
test('TheMealDB: busca, detalhe e receita aleatória', async () => {
  assert.equal((await buscarReceitas('chicken'))[0].ingredientes[0].medida, '300 g')
  assert.equal((await receitaPorId('52772')).nome, 'Soup')
  assert.equal((await receitaAleatoria()).nome, 'Surpresa')
})
test('ViaCEP cai para BrasilAPI se o serviço falhar', async () => {
  const endereco = await enderecoPorCep('01001000')
  assert.equal(endereco.fonte, 'BrasilAPI (fallback)')
  assert.equal(endereco.cidade, 'São Paulo')
  assert.ok(requisicoes.some(u => u.includes('viacep.com.br')))
})
test('IBGE normaliza estados e cidades', async () => {
  assert.equal((await listarEstados())[0].sigla, 'CE')
  assert.equal((await listarCidades('CE'))[0].nome, 'Fortaleza')
})
