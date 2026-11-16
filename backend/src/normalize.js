export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '')
export const cepValido = (valor) => /^\d{8}$/.test(somenteDigitos(valor))
export const codigoBarrasValido = (valor) => /^\d{8,14}$/.test(somenteDigitos(valor))
export const nomeValido = (valor, minimo = 2, maximo = 140) => typeof valor === 'string' && valor.trim().length >= minimo && valor.trim().length <= maximo
export const emailValido = (valor) => typeof valor === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) && valor.length <= 180
export const imagemUrlValida = (valor) => {
  if (!valor) return true
  if (typeof valor !== 'string') return false
  if (/^\/api\/media\/[0-9a-f-]{36}\.(?:jpg|png|webp|mp4|webm)$/.test(valor)) return true
  try { const u = new URL(valor); return ['https:', 'http:'].includes(u.protocol) && valor.length <= 500 } catch { return false }
}
export function urlExternaSegura(valor) {
  return imagemUrlValida(valor) && valor ? String(valor) : null
}
export function normalizarProduto(p) {
  if (!p) return null
  const n = p.nutriments || {}
  return {
    codigo: String(p.code || p._id || ''), nome: p.product_name_pt || p.product_name || 'Produto sem nome',
    marca: p.brands || '', imagem: urlExternaSegura(p.image_front_small_url || p.image_url),
    ingredientes: p.ingredients_text_pt || p.ingredients_text || '',
    alergicos: p.allergens || '', nutriScore: p.nutriscore_grade || null,
    calorias100g: n['energy-kcal_100g'] ?? null, proteinas100g: n.proteins_100g ?? null,
    carboidratos100g: n.carbohydrates_100g ?? null, gorduras100g: n.fat_100g ?? null,
    fonte: 'Open Food Facts', unidade: 'por 100 g ou 100 ml (conforme o produto)',
  }
}
export function normalizarRefeicao(r) {
  if (!r) return null
  const ingredientes = Array.from({ length: 20 }, (_, i) => {
    const nome = r[`strIngredient${i + 1}`]?.trim()
    return nome ? { nome, medida: r[`strMeasure${i + 1}`]?.trim() || '' } : null
  }).filter(Boolean)
  return { id: String(r.idMeal), nome: r.strMeal, categoria: r.strCategory || '', pais: r.strArea || '',
    imagem: urlExternaSegura(r.strMealThumb), preparo: r.strInstructions || '', ingredientes,
    video: urlExternaSegura(r.strYoutube), fonte: 'TheMealDB', idioma: 'en' }
}
export function normalizarEndereco(v, fonte) {
  return {
    cep: v.cep || '', logradouro: v.logradouro || v.street || '', bairro: v.bairro || v.neighborhood || '',
    cidade: v.localidade || v.city || '', uf: v.uf || v.state || '',
    ibge: v.ibge || '', fonte,
  }
}
