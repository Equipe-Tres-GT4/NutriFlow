/** Curadoria de fotografias para o seed acadêmico, sem chaves privadas.
 * Consulta imagens de pratos em Wikimedia Commons e aceita apenas licenças abertas.
 * Não declara que a foto é de quem publicou a receita: são imagens ilustrativas.
 */
export const termosFotografia = [
  ['Mingau de aveia com banana e canela', 'banana cinnamon oatmeal porridge'],
  ['Frango ao limão com batata-doce', 'chicken sweet potato roast'],
  ['Vitamina de manga com aveia sem leite', 'mango smoothie'],
  ['Bolo de cacau e banana sem leite', 'chocolate banana cake'],
  ['Vitamina de banana com aveia', 'banana smoothie oats drink'],
  ['Panqueca de banana sem leite', 'banana pancakes'],
  ['Bolo de cenoura sem lactose', 'carrot cake'],
  ['Creme de abóbora com gengibre', 'pumpkin soup'],
  ['Mingau de aveia com maçã', 'oatmeal apple porridge'],
  ['Peixe assado com ervas e limão', 'baked fish herbs lemon'],
  ['Salada morna de grão-de-bico e cenoura', 'chickpea salad carrot'],
  ['Arroz integral com cenoura e cúrcuma', 'rice with carrots turmeric'],
  ['Abobrinha recheada com lentilhas', 'stuffed zucchini'],
  ['Pasta de feijão-branco com alecrim', 'white bean hummus dip'],
  ['Tapioca com ovo mexido e tomate', 'tapioca egg breakfast'],
  ['Bowl de arroz, frango e brócolis', 'chicken rice broccoli bowl'],
  ['Pãozinho de frigideira sem glúten', 'gluten free flatbread'],
  ['Polenta cremosa com cogumelos', 'polenta mushrooms'],
  ['Panqueca de farinha de arroz com maçã', 'apple pancakes'],
  ['Arroz de panela com lentilha e cebola', 'mujadara rice lentils onion'],
  ['Omelete de couve com tomate', 'vegetable omelette tomato'],
  ['Sopa de feijão com abóbora', 'bean soup pumpkin'],
  ['Macarrão com molho de tomate e cenoura', 'pasta tomato sauce'],
  ['Bolo de milho de liquidificador', 'corn cake brazil'],
  ['Hambúrguer de grão-de-bico e aveia', 'chickpea burger'],
  ['Curry de lentilha com leite de coco', 'lentil curry coconut'],
  ['Quibe assado de abóbora e trigo', 'baked kibbeh pumpkin'],
  ['Wrap de homus com vegetais crocantes', 'hummus vegetable wrap'],
  ['Nhoque de batata com molho fresco', 'gnocchi tomato sauce'],
]
export const termosPorReceita = Object.fromEntries(termosFotografia)
export const fotoAberta = license => /^(?:CC0(?:\s|$)|CC BY(?:-SA)?(?:\s|$)|Public domain|Public Domain|PD[- ])/.test(license || '')
const semHtml = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim().slice(0, 180)

export async function buscarFotoCommons(termo, { fetcher = fetch, usados = new Set(), timeout = 8500 } = {}) {
  const palavras = termo.split(/\s+/).filter(w => w.length > 3 && !['with','from','over','rice','food','bowl','baked'].includes(w.toLowerCase()))
  const consulta = (palavras.length ? palavras : termo.split(/\s+/)).slice(0, 2).join(' ')
  const qs = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: consulta, gsrnamespace: '6', gsrlimit: '14', prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1000', iiextmetadatafilter: 'LicenseShortName|Artist|UsageTerms', format: 'json' })
  const resp = await fetcher(`https://commons.wikimedia.org/w/api.php?${qs}`, { signal: AbortSignal.timeout(timeout), headers: { 'User-Agent': 'NutriFlowAcademicDemo/1.0 (educational food photography attribution)' } })
  if (!resp.ok) throw new Error(`Wikimedia Commons HTTP ${resp.status}`)
  const data = await resp.json()
  const fotos = Object.values(data.query?.pages || {}).map(page => {
    const foto = page.imageinfo?.[0]
    const license = semHtml(foto?.extmetadata?.LicenseShortName?.value)
    return {
      titulo: page.title,
      url: foto?.thumburl || foto?.url,
      fonteUrl: foto?.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      autor: semHtml(foto?.extmetadata?.Artist?.value) || 'Contribuinte do Wikimedia Commons',
      licenca: license,
      width: foto?.width || 0,
      mime: foto?.mime,
    }
  }).filter(f => f.url?.startsWith('https://') && !usados.has(f.url) && /^image\/(jpeg|png|webp)$/.test(f.mime || '') && f.width >= 640 && fotoAberta(f.licenca) && !/logo|icon|poster|diagram|map|packaging|advert|svg|symbol/i.test(f.titulo))
  const words = termo.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  fotos.sort((a,b) => words.filter(w => b.titulo.toLowerCase().includes(w)).length - words.filter(w => a.titulo.toLowerCase().includes(w)).length)
  const melhor = fotos[0]
  if (!melhor || !words.some(w => melhor.titulo.toLowerCase().includes(w))) return null
  return melhor
}
