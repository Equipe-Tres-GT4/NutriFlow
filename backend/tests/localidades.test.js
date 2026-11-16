import { describe, it, expect } from '@jest/globals'
import { ESTADOS_BRASIL, ordenarEstados, validarEstados } from '../src/localidades.js'

describe('Cadastro e perfil sem dependência obrigatória do IBGE', () => {
  it('disponibiliza as 27 unidades federativas na lista de reserva', () => {
    expect(ESTADOS_BRASIL).toHaveLength(27)
    expect(new Set(ESTADOS_BRASIL.map(e => e.sigla)).size).toBe(27)
    expect(ESTADOS_BRASIL.find(e => e.sigla === 'CE')).toEqual({ id: 23, sigla: 'CE', nome: 'Ceará' })
    expect(validarEstados(ESTADOS_BRASIL)).toBe(true)
  })
  it('mantém ordenação pt-BR e rejeita dados externos inválidos', () => {
    expect(ordenarEstados(ESTADOS_BRASIL)[0].nome).toBe('Acre')
    expect(validarEstados([{ sigla: '???', nome: '', id: 'xx' }])).toBe(false)
  })
})
