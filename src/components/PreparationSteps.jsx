import { useState } from 'react'

export default function PreparationSteps({ passos }) {
  const [concluidos, setConcluidos] = useState({})

  const togglePasso = (index) => {
    setConcluidos((prev) => ({ ...prev, [index]: !prev[index] }))
  };

  return (
    <section>
      <h2 className="h5 fw-bold mb-3">Modo de preparo</h2>
      <ol className="list-unstyled d-grid gap-3 mb-0">
        {(passos || []).map((passo, idx) => (
          <li key={`${passo}-${idx}`} className="d-flex align-items-start gap-2">
            <span className="badge rounded-pill text-bg-success">{idx + 1}</span>
            <span className={`flex-grow-1 ${concluidos[idx] ? 'text-decoration-line-through text-secondary' : ''}`}>
              {passo}
            </span>
            <input
              type="checkbox"
              className="form-check-input mt-1 flex-shrink-0"
              checked={!!concluidos[idx]}
              onChange={() => togglePasso(idx)}
              aria-label={`Marcar etapa ${idx + 1} como concluída`}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}