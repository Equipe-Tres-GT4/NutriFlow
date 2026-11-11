import { describe, it, expect } from '@jest/globals'
import { cepValido, codigoBarrasValido, normalizarProduto, normalizarRefeicao, normalizarEndereco, imagemUrlValida } from '../src/normalize.js'

describe('Normalização de APIs externas', () => {
  it('valida CEP e código de barras antes de chamar serviços', () => {
    expect(cepValido('60.000-000')).toBe(true)
    expect(cepValido('123')).toBe(false)
    expect(codigoBarrasValido('3017620422003')).toBe(true)
    expect(codigoBarrasValido('abc')).toBe(false)
  })
  it('mantém valores nutricionais e identifica a origem', () => {
    const produto = normalizarProduto({ code: '123', product_name: 'Iogurte', nutriments: { 'energy-kcal_100g': 80, proteins_100g: 3.5 } })
    expect(produto.calorias100g).toBe(80)
    expect(produto.proteinas100g).toBe(3.5)
    expect(produto.fonte).toBe('Open Food Facts')
  })
  it('remove ingredientes vazios, mesmo com 20 campos', () => {
    const receita = normalizarRefeicao({ idMeal: '55', strMeal: 'Soup', strIngredient1: 'Water', strMeasure1: '1 cup', strIngredient2: '' })
    expect(receita.ingredientes).toEqual([{ nome: 'Water', medida: '1 cup' }])
  })
  it('padroniza endereços de provedores distintos', () => {
    expect(normalizarEndereco({ city: 'Fortaleza', state: 'CE' }, 'BrasilAPI').cidade).toBe('Fortaleza')
  })
  it('bloqueia URLs inválidas para imagens da comunidade', () => {
    expect(imagemUrlValida('javascript:alert(1)')).toBe(false)
    expect(imagemUrlValida('https://example.com/i.jpg')).toBe(true)
  })
})
