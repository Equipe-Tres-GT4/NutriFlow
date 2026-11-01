export default function NutritionCard({ valor, unidade, label, textoExplicativo, corFundo }) {
  return (
    <div
      className="bg-white border rounded-3 p-3 h-100"
      style={corFundo ? { backgroundColor: corFundo } : undefined}
    >
      <p className="h4 fw-bold text-dark mb-1">
        {valor}<span className="fs-6 fw-semibold ms-1">{unidade}</span>
      </p>
      <p className="small fw-medium text-secondary mb-0">{label}</p>
      {textoExplicativo && <p className="small text-secondary mt-1 mb-0">{textoExplicativo}</p>}
    </div>
  );
}