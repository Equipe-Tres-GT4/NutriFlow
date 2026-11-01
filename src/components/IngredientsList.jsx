import { useState } from 'react'

const lerQuantidade = (valor) => {
  const partes = valor.trim().split(/\s+/)
  if (partes.length === 2 && partes[1].includes('/')) {
    const [numerador, denominador] = partes[1].split('/').map(Number)
    return Number(partes[0]) + numerador / denominador
  }
  if (valor.includes('/')) {
    const [numerador, denominador] = valor.split('/').map(Number)
    return numerador / denominador
  }
  return Number(valor.replace(',', '.'))
}

const formatarQuantidade = (quantidade) =>
  Number(quantidade).toLocaleString('pt-BR', { maximumFractionDigits: 2 })

const ajustarQuantidade = (ingrediente, porcoes, porcoesIniciais) => {
  const correspondencia = ingrediente.match(/^(\s*)(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)(?=\s|$)(.*)$/)
  if (!correspondencia) return ingrediente

  const [, espaco, quantidadeOriginal, restante] = correspondencia
  const quantidade = lerQuantidade(quantidadeOriginal)
  const fator = porcoes / Math.max(1, Number(porcoesIniciais) || 1)
  if (!Number.isFinite(quantidade) || fator === 1) return ingrediente

  return `${espaco}${formatarQuantidade(quantidade * fator)}${restante}`
}

export default function IngredientsList({ porcoesIniciais = 2, ingredientesBase }) {
  const [porcoes, setPorcoes] = useState(porcoesIniciais);
  const [checados, setChecados] = useState({})

  const alterarPorcoes = (delta) => {
    setPorcoes((prev) => Math.max(1, prev + delta))
  };

  const toggleCheck = (index) => {
    setChecados((prev) => ({ ...prev, [index]: !prev[index] }))
  };

  const listaIngredientes = Array.isArray(ingredientesBase) ? ingredientesBase : [];

  return (
    <section>
      <h2 className="h5 fw-bold mb-3">Ingredientes</h2>
      <div className="d-inline-flex align-items-center gap-3 bg-white border rounded-pill px-2 py-1 mb-3">
        <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={() => alterarPorcoes(-1)} aria-label="Diminuir porções">
          <i className="bi bi-dash" aria-hidden="true"></i>
        </button>
        <span className="small fw-semibold">{porcoes} porções</span>
        <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={() => alterarPorcoes(1)} aria-label="Aumentar porções">
          <i className="bi bi-plus" aria-hidden="true"></i>
        </button>
      </div>
      <ul className="list-unstyled d-grid gap-2 mb-0">
        {(ingredientesBase || []).map((item, idx) => {
          const estaChecado = checados[idx]
          const nomeItem = typeof item === 'string'
            ? ajustarQuantidade(item, porcoes, porcoesIniciais)
            : item.qtdBase != null || item.quantidade != null
              ? `${formatarQuantidade((Number(item.qtdBase ?? item.quantidade) / porcoesIniciais) * porcoes)} ${item.unidade || ''} ${item.nome || ''}`.trim()
              : item.nome || ''

          return (
            <li key={`${nomeItem}-${idx}`} className="form-check">
              <input
                id={`ingrediente-${idx}`}
                type="checkbox"
                className="form-check-input"
                checked={!!estaChecado}
                onChange={() => toggleCheck(idx)}
              />
              <label htmlFor={`ingrediente-${idx}`} className={`form-check-label ${estaChecado ? 'text-decoration-line-through text-secondary' : ''}`}>
                {nomeItem}
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}