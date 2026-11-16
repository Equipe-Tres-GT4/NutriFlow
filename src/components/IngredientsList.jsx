
import { useId, useState } from 'react'

const normalizarPorcoes = (valor) => {
  const numero = Number(valor)
  return Number.isFinite(numero) && numero > 0 ? numero : 2
}

const lerQuantidade = (valor) => {
  const texto = String(valor ?? '').trim().replace(',', '.')

  if (!texto) return NaN

  // Exemplo: 1 1/2 = 1,5
  const numeroMisto = texto.match(/^(\d+)\s+(\d+)\/(\d+)$/)

  if (numeroMisto) {
    const inteiro = Number(numeroMisto[1])
    const numerador = Number(numeroMisto[2])
    const denominador = Number(numeroMisto[3])

    if (denominador === 0) return NaN

    return inteiro + numerador / denominador
  }

  // Exemplo: 1/2 = 0,5
  const fracao = texto.match(/^(\d+)\/(\d+)$/)

  if (fracao) {
    const numerador = Number(fracao[1])
    const denominador = Number(fracao[2])

    if (denominador === 0) return NaN

    return numerador / denominador
  }

  return Number(texto)
}

const formatarQuantidade = (quantidade) => {
  const numero = Number(quantidade)

  if (!Number.isFinite(numero)) return ''

  return numero.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  })
}

const ajustarQuantidade = (
  ingrediente,
  porcoes,
  porcoesIniciais
) => {
  if (typeof ingrediente !== 'string') return ''

  const correspondencia = ingrediente.match(
    /^(\s*)(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)(?=\s|$)(.*)$/
  )

  if (!correspondencia) return ingrediente

  const [, espaco, quantidadeOriginal, restante] = correspondencia

  const quantidade = lerQuantidade(quantidadeOriginal)
  const fator = porcoes / normalizarPorcoes(porcoesIniciais)

  if (!Number.isFinite(quantidade) || fator === 1) {
    return ingrediente
  }

  return `${espaco}${formatarQuantidade(quantidade * fator)}${restante}`
}

const formatarIngrediente = (
  item,
  porcoes,
  porcoesIniciais
) => {
  if (typeof item === 'string') {
    return ajustarQuantidade(item, porcoes, porcoesIniciais)
  }

  if (!item || typeof item !== 'object') {
    return ''
  }

  const quantidadeOriginal = item.qtdBase ?? item.quantidade

  if (quantidadeOriginal == null) {
    return item.nome || ''
  }

  const quantidade = lerQuantidade(quantidadeOriginal)
  const fator = porcoes / normalizarPorcoes(porcoesIniciais)

  const quantidadeFormatada = Number.isFinite(quantidade)
    ? formatarQuantidade(quantidade * fator)
    : String(quantidadeOriginal)

  return [
    quantidadeFormatada,
    item.unidade || '',
    item.nome || '',
  ]
    .filter((parte) => String(parte).trim() !== '')
    .join(' ')
    .trim()
}

export default function IngredientsList({
  porcoesIniciais = 2,
  ingredientesBase = [],
}) {
  const idPrefixo = useId()

  const [porcoes, setPorcoes] = useState(() =>
    normalizarPorcoes(porcoesIniciais)
  )

  const [checados, setChecados] = useState({})

  const alterarPorcoes = (delta) => {
    setPorcoes((anterior) => Math.max(1, anterior + delta))
  }

  const toggleCheck = (index) => {
    setChecados((anterior) => ({
      ...anterior,
      [index]: !anterior[index],
    }))
  }

  const ingredientes = Array.isArray(ingredientesBase)
    ? ingredientesBase
    : []

  return (
    <section>
      <h2 className="h5 fw-bold mb-3">
        Ingredientes
      </h2>

      <div className="d-inline-flex align-items-center gap-3 bg-white border rounded-pill px-2 py-1 mb-3">
        <button
          type="button"
          className="btn btn-sm btn-light rounded-circle"
          onClick={() => alterarPorcoes(-1)}
          disabled={porcoes <= 1}
          aria-label="Diminuir porções"
        >
          <i className="bi bi-dash" aria-hidden="true" />
        </button>

        <span className="small fw-semibold">
          {formatarQuantidade(porcoes)}{' '}
          {porcoes === 1 ? 'porção' : 'porções'}
        </span>

        <button
          type="button"
          className="btn btn-sm btn-light rounded-circle"
          onClick={() => alterarPorcoes(1)}
          aria-label="Aumentar porções"
        >
          <i className="bi bi-plus" aria-hidden="true" />
        </button>
      </div>

      <ul className="list-unstyled d-grid gap-2 mb-0">
        {ingredientes.map((item, idx) => {
          const estaChecado = Boolean(checados[idx])

          const nomeItem = formatarIngrediente(
            item,
            porcoes,
            porcoesIniciais
          )

          const inputId = `${idPrefixo}-ingrediente-${idx}`

          return (
            <li key={idx} className="form-check">
              <input
                id={inputId}
                type="checkbox"
                className="form-check-input"
                checked={estaChecado}
                onChange={() => toggleCheck(idx)}
              />

              <label
                htmlFor={inputId}
                className={`form-check-label ${
                  estaChecado
                    ? 'text-decoration-line-through text-secondary'
                    : ''
                }`}
              >
                {nomeItem}
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
