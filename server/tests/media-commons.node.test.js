import test from 'node:test'
import assert from 'node:assert/strict'
import { termosPorReceita, fotoAberta, buscarFotoCommons } from '../src/media-commons.js'
import { perfisDemo } from '../src/demo-content.js'

test('as 25 receitas fictícias têm pesquisa contextual de fotografia', () => {
  const nomes = perfisDemo.flatMap(p => p.receitas.map(r => r.nome))
  assert.equal(nomes.length, 25)
  assert.equal(new Set(nomes).size, 25)
  assert.ok(nomes.every(n => termosPorReceita[n]))
})
test('licenças não comerciais e sem adaptações são rejeitadas para o seed', () => {
  assert.equal(fotoAberta('CC BY-NC 4.0'), false)
  assert.equal(fotoAberta('CC BY-ND 4.0'), false)
  assert.equal(fotoAberta('CC BY-SA 4.0'), true)
  assert.equal(fotoAberta('CC0 1.0'), true)
})
test('foto Commons selecionada acompanha crédito e origem verificável', async () => {
  const fetcher = async () => ({ ok: true, json: async () => ({ query: { pages: {
    1: { title: 'File:Logo pumpkin soup.png', imageinfo: [{ mime: 'image/png', width: 1200, thumburl: 'https://example.test/logo.png', extmetadata: { LicenseShortName: {value:'CC BY 4.0'} } }] },
    2: { title: 'File:Pumpkin soup.jpg', imageinfo: [{ mime: 'image/jpeg', width: 1200, thumburl: 'https://example.test/pumpkin.jpg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Pumpkin_soup.jpg', extmetadata: { LicenseShortName: {value:'CC BY-SA 4.0'}, Artist: {value:'Chef Demo'} } }] },
  } } }) })
  const r = await buscarFotoCommons('pumpkin soup', { fetcher })
  assert.equal(r.autor,'Chef Demo')
  assert.equal(r.licenca,'CC BY-SA 4.0')
  assert.equal(r.url,'https://example.test/pumpkin.jpg')
  assert.match(r.fonteUrl, /commons\.wikimedia/)
})
