/** Jornadas reais: alimentos pesquisados, alimentos cadastrados, receitas e coleção pessoal.
 * As integrações externas são adaptadores do catálogo, e não telas independentes.
 */
import { Router } from 'express'
import { Op } from 'sequelize'
import { Alimento, AlimentoSalvo, Receita, ReceitaSalva, Usuario, Publicacao } from './models.js'
import { autenticar, asyncRoute } from './security.js'
import { codigoBarrasValido, imagemUrlValida, nomeValido, somenteDigitos } from './normalize.js'
import { buscarProdutos, produtoPorCodigo, buscarReceitas, receitaPorId, receitaAleatoria } from './external.js'
import { excluirReceitaComDependencias } from './exclusao.js'

export const catalogo = Router()
const txt = v => typeof v === 'string' ? v.trim() : ''
const idValido = v => /^[1-9]\d{0,9}$/.test(String(v)) ? Number(v) : null
const falha = (res, msg) => res.status(400).json({ erro: msg })
const url = v => txt(v) && imagemUrlValida(txt(v)) ? txt(v) : null
const numerico = v => v === '' || v === null || v === undefined ? null : (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 1_000_000 ? Number(v) : NaN)
function formatarAlimento(a) {
  const x = a.get({ plain: true })
  return { ...x, chave: `local:${x.id}`, imagem: x.imagemUrl, fonte: 'Comunidade', autor: x.autor ? { id: x.autor.id, nome: x.autor.nome } : null }
}
function formatarReceita(r) {
  const x = r.get({ plain: true })
  return { ...x, id: `local:${x.id}`, ingredientes: JSON.parse(x.ingredientes), imagem: x.imagemUrl, video: x.videoUrl || null,
    fotoCredito: x.fotoCredito ? JSON.parse(x.fotoCredito) : null,
    fonte: 'Comunidade', autor: x.autor ? { id: x.autor.id, nome: x.autor.nome, fotoUrl: x.autor.fotoUrl || null, isDemo: Boolean(x.autor.isDemo) } : null }
}
const includeAutor = [{ model: Usuario, as: 'autor', attributes: ['id','nome','fotoUrl','isDemo'] }]

catalogo.get('/foods', asyncRoute(async (req, res) => {
  const q = txt(req.query.q).slice(0, 80)
  const where = q ? { [Op.or]: [{ nome: { [Op.like]: `%${q}%` } }, { marca: { [Op.like]: `%${q}%` } }] } : {}
  const locais = (await Alimento.findAll({ where, include: includeAutor, order: [['createdAt','DESC']], limit: 30 })).map(formatarAlimento)
  if (!q) return res.json({ alimentos: locais, fonteExterna: false })
  let produtos = [], aviso = ''
  try {
    if (codigoBarrasValido(q)) {
      const achado = await produtoPorCodigo(somenteDigitos(q))
      if (achado) produtos = [achado]
    } else if (q.length >= 2) produtos = await buscarProdutos(q)
  } catch (e) { aviso = e.status === 404 ? 'Nenhum produto com esse código de barras.' : 'A consulta de rótulos está temporariamente indisponível; mostrando dados da comunidade.' }
  return res.json({ alimentos: [...locais, ...produtos.map(p => ({ ...p, chave: `off:${p.codigo}` }))], fonteExterna: true, aviso })
}))
catalogo.post('/foods', autenticar, asyncRoute(async (req, res) => {
  const { nome, marca, codigoBarras, imagemUrl, calorias100g, proteinas100g, carboidratos100g, gorduras100g } = req.body || {}
  if (!nomeValido(nome, 2, 140) || txt(marca).length > 100 || (codigoBarras && !codigoBarrasValido(codigoBarras)) || !imagemUrlValida(imagemUrl)) return falha(res, 'Nome, marca, código ou imagem inválidos.')
  const nums = [calorias100g, proteinas100g, carboidratos100g, gorduras100g].map(numerico)
  if (nums.some(n => Number.isNaN(n))) return falha(res, 'Informe valores nutricionais numéricos e não negativos por 100 g/ml.')
  const a = await Alimento.create({ nome: txt(nome), marca: txt(marca), codigoBarras: codigoBarras ? somenteDigitos(codigoBarras) : null, imagemUrl: url(imagemUrl), calorias100g: nums[0], proteinas100g: nums[1], carboidratos100g: nums[2], gorduras100g: nums[3], autorId: req.usuarioId })
  res.status(201).json({ alimento: { id: a.id, chave: `local:${a.id}` } })
}))
catalogo.put('/foods/:id', autenticar, asyncRoute(async (req, res) => {
  const a = await Alimento.findByPk(idValido(req.params.id))
  if (!a) return res.status(404).json({ erro: 'Alimento não encontrado.' })
  if (a.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Somente o autor pode editar.' })
  const { nome, marca, codigoBarras, imagemUrl, calorias100g, proteinas100g, carboidratos100g, gorduras100g } = req.body || {}
  if (!nomeValido(nome,2,140) || txt(marca).length>100 || (codigoBarras && !codigoBarrasValido(codigoBarras)) || !imagemUrlValida(imagemUrl)) return falha(res, 'Dados do alimento inválidos.')
  const numeros = [calorias100g,proteinas100g,carboidratos100g,gorduras100g].map(numerico)
  if (numeros.some(n=>Number.isNaN(n))) return falha(res, 'Os nutrientes devem ser numéricos e não negativos.')
  await a.update({ nome:txt(nome),marca:txt(marca),codigoBarras:codigoBarras?somenteDigitos(codigoBarras):null,imagemUrl:url(imagemUrl),calorias100g:numeros[0],proteinas100g:numeros[1],carboidratos100g:numeros[2],gorduras100g:numeros[3] })
  await AlimentoSalvo.update({ nome: a.nome, marca: a.marca, imagemUrl: a.imagemUrl }, { where: { chave: `local:${a.id}` } })
  res.json({ alimento: { id:a.id, chave:`local:${a.id}` } })
}))
catalogo.delete('/foods/:id', autenticar, asyncRoute(async (req, res) => {
  const alimento = await Alimento.findByPk(idValido(req.params.id))
  if (!alimento) return res.status(404).json({ erro: 'Alimento não encontrado.' })
  if (alimento.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Somente o autor pode remover.' })
  await AlimentoSalvo.destroy({ where: { chave: `local:${alimento.id}` } }); await alimento.destroy(); res.status(204).end()
}))
catalogo.get('/saved/foods', autenticar, asyncRoute(async (req, res) => {
  res.json({ alimentos: await AlimentoSalvo.findAll({ where: { usuarioId: req.usuarioId }, order: [['createdAt','DESC']] }) })
}))
catalogo.post('/saved/foods', autenticar, asyncRoute(async (req, res) => {
  const chave = txt(req.body?.chave)
  let nome, marca, imagemUrl, fonte
  if (/^local:[1-9]\d*$/.test(chave)) {
    const a = await Alimento.findByPk(idValido(chave.split(':')[1]))
    if (!a) return res.status(404).json({ erro: 'Alimento não encontrado.' })
    ;({ nome, marca, imagemUrl } = a); fonte = 'Comunidade'
  } else if (/^off:\d{8,14}$/.test(chave)) {
    const p = await produtoPorCodigo(chave.slice(4))
    ;({ nome, marca } = p); imagemUrl = p.imagem; fonte = 'Open Food Facts'
  } else return falha(res, 'Referência de alimento inválida.')
  const [salvo] = await AlimentoSalvo.findOrCreate({ where: { usuarioId: req.usuarioId, chave }, defaults: { nome, marca, imagemUrl, fonte } })
  res.status(201).json({ alimento: salvo })
}))
catalogo.delete('/saved/foods/:chave', autenticar, asyncRoute(async (req, res) => {
  await AlimentoSalvo.destroy({ where: { usuarioId: req.usuarioId, chave: req.params.chave } }); res.status(204).end()
}))

catalogo.get('/recipes', asyncRoute(async (req, res) => {
  const q = txt(req.query.q).slice(0, 80)
  const where = q ? { nome: { [Op.like]: `%${q}%` } } : {}
  const receitas = (await Receita.findAll({ where, include: includeAutor, order: [['createdAt','DESC']], limit: 30 })).map(formatarReceita)
  let aviso = ''
  if (q.length >= 2) {
    try { receitas.push(...(await buscarReceitas(q)).map(r => ({ ...r, id: `externa:${r.id}` }))) }
    catch { aviso = 'As receitas internacionais não estão disponíveis agora; exibindo as receitas da comunidade.' }
  }
  res.json({ receitas, aviso })
}))
catalogo.get('/recipes/surprise', asyncRoute(async (_req, res) => {
  const r = await receitaAleatoria()
  if (!r) return res.status(404).json({ erro: 'Não foi possível encontrar uma sugestão.' })
  res.json({ receita: { ...r, id: `externa:${r.id}` } })
}))
catalogo.get('/recipes/:id/post', asyncRoute(async (req, res) => {
  const id = idValido(req.params.id)
  if (!id) return falha(res, 'Receita inválida.')
  const post = await Publicacao.findOne({ where: { receitaId: id }, attributes: ['id'] })
  if (!post) return res.status(404).json({ erro: 'Conversa não encontrada.' })
  res.json({ postId: post.id })
}))
catalogo.get('/recipes/:chave', asyncRoute(async (req, res) => {
  const chave = req.params.chave
  if (/^externa:\d{1,12}$/.test(chave)) {
    const receita = await receitaPorId(chave.slice(8))
    return res.json({ receita: { ...receita, id: chave } })
  }
  if (!/^local:[1-9]\d*$/.test(chave)) return falha(res, 'Referência de receita inválida.')
  const receita = await Receita.findByPk(idValido(chave.slice(6)), { include: includeAutor })
  if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' })
  res.json({ receita: formatarReceita(receita) })
}))
// Histórico de versões visível no detalhe e no feed.
catalogo.get('/recipes/:id/versions', asyncRoute(async (req, res) => {
  const id = idValido(req.params.id)
  if (!id) return falha(res, 'ID de receita inválido.')
  const origem = await Receita.findByPk(id)
  if (!origem) return res.status(404).json({ erro: 'Receita original não encontrada.' })
  const raiz = origem.receitaOriginalId || origem.id
  const versoes = await Receita.findAll({ where: { receitaOriginalId: raiz }, include: includeAutor, order: [['createdAt', 'ASC']], limit: 100 })
  res.json({ originalId: `local:${raiz}`, versoes: versoes.map(formatarReceita) })
}))
catalogo.post('/recipes', autenticar, asyncRoute(async (req, res) => {
  const { nome, resumo, porcoes, ingredientes, preparo, dificuldade, tempoMin, imagemUrl, videoUrl, receitaOriginalId } = req.body || {}
  const originalId = receitaOriginalId === undefined || receitaOriginalId === null || receitaOriginalId === '' ? null : idValido(receitaOriginalId)
  if (receitaOriginalId && (!originalId || !(await Receita.findByPk(originalId)))) return falha(res, 'Receita original inválida para criar versão.')
  if (!imagemUrlValida(videoUrl)) return falha(res, 'Vídeo inválido.')
  if (!nomeValido(nome, 3, 140) || !Array.isArray(ingredientes) || ingredientes.length < 1 || ingredientes.length > 50 || ingredientes.some(i => !nomeValido(i, 2, 160)) || !nomeValido(preparo, 15, 5000) || !['Fácil','Médio','Difícil'].includes(dificuldade) || !imagemUrlValida(imagemUrl) || !Number.isInteger(Number(tempoMin)) || Number(tempoMin) < 1 || Number(tempoMin) > 1440) return falha(res, 'Preencha título, ingredientes, preparo, dificuldade e tempo válidos.')
  if (resumo !== undefined && (typeof resumo !== 'string' || resumo.length > 450)) return falha(res, 'Descrição deve ter até 450 caracteres.')
  if (porcoes !== undefined && (!Number.isInteger(Number(porcoes)) || Number(porcoes) < 1 || Number(porcoes) > 100)) return falha(res, 'Informe de 1 a 100 porções.')
  const receita = await Receita.create({ nome: txt(nome), resumo: txt(resumo), porcoes: porcoes === undefined ? 2 : Number(porcoes), ingredientes: JSON.stringify(ingredientes.map(txt)), preparo: txt(preparo), dificuldade, tempoMin: Number(tempoMin), imagemUrl: url(imagemUrl), videoUrl: url(videoUrl), receitaOriginalId: originalId, autorId: req.usuarioId })
  // Uma receita cadastrada vira também uma publicação no feed, sem misturar os dados estruturados.
  await Publicacao.create({ receitaId: receita.id, titulo: receita.nome, conteudo: `Ingredientes:\n${ingredientes.join('\n')}\n\nModo de preparo:\n${receita.preparo}\n\nReceita: /receitas/local:${receita.id}`, tipo: 'receita', imagemUrl: receita.imagemUrl, videoUrl: receita.videoUrl, autorId: req.usuarioId })
  res.status(201).json({ receita: { id: `local:${receita.id}` } })
}))
catalogo.put('/recipes/:id', autenticar, asyncRoute(async (req, res) => {
  const receita = await Receita.findByPk(idValido(req.params.id))
  if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' })
  if (receita.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Somente o autor pode editar.' })
  const { nome, resumo, porcoes, ingredientes, preparo, tempoMin, dificuldade, imagemUrl, videoUrl } = req.body || {}
  if (!nomeValido(nome, 3, 140) || !Array.isArray(ingredientes) || ingredientes.length < 1 || ingredientes.length > 50 || ingredientes.some(i => !nomeValido(i, 2, 160)) || !nomeValido(preparo, 15, 5000) || !['Fácil','Médio','Difícil'].includes(dificuldade) || !imagemUrlValida(imagemUrl) || !imagemUrlValida(videoUrl) || !Number.isInteger(Number(tempoMin)) || Number(tempoMin) < 1 || Number(tempoMin) > 1440) return falha(res, 'Dados de receita inválidos.')
  if (resumo !== undefined && (typeof resumo !== 'string' || resumo.length > 450)) return falha(res, 'Descrição deve ter até 450 caracteres.')
  if (porcoes !== undefined && (!Number.isInteger(Number(porcoes)) || Number(porcoes) < 1 || Number(porcoes) > 100)) return falha(res, 'Informe de 1 a 100 porções.')
  await receita.update({ nome: txt(nome), resumo: resumo === undefined ? receita.resumo : txt(resumo), porcoes: porcoes === undefined ? receita.porcoes : Number(porcoes), ingredientes: JSON.stringify(ingredientes.map(txt)), preparo: txt(preparo), dificuldade, tempoMin: Number(tempoMin), imagemUrl: url(imagemUrl), videoUrl: url(videoUrl), fotoCredito: null })
  await ReceitaSalva.update({ nome: receita.nome, imagemUrl: receita.imagemUrl }, { where: { chave: `local:${receita.id}` } })
  await Publicacao.update({ titulo: receita.nome, imagemUrl: receita.imagemUrl, videoUrl: receita.videoUrl, conteudo: `Ingredientes:\n${ingredientes.join('\n')}\n\nModo de preparo:\n${receita.preparo}\n\nReceita: /receitas/local:${receita.id}` }, { where: { receitaId: receita.id } })
  res.json({ receita: formatarReceita(await Receita.findByPk(receita.id, { include: includeAutor })) })
}))
catalogo.delete('/recipes/:id', autenticar, asyncRoute(async (req, res) => {
  const receita = await Receita.findByPk(idValido(req.params.id))
  if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' })
  if (receita.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Somente o autor pode excluir.' })
  await excluirReceitaComDependencias(receita.id)
  res.status(204).end()
}))
catalogo.get('/saved/recipes', autenticar, asyncRoute(async (req, res) => {
  res.json({ receitas: await ReceitaSalva.findAll({ where: { usuarioId: req.usuarioId }, order: [['createdAt','DESC']] }) })
}))
catalogo.post('/saved/recipes', autenticar, asyncRoute(async (req, res) => {
  const chave = txt(req.body?.chave)
  let nome, imagemUrl, fonte
  if (/^local:[1-9]\d*$/.test(chave)) {
    const r = await Receita.findByPk(idValido(chave.slice(6)))
    if (!r) return res.status(404).json({ erro: 'Receita não encontrada.' })
    nome = r.nome; imagemUrl = r.imagemUrl; fonte = 'Comunidade'
  } else if (/^externa:\d{1,12}$/.test(chave)) {
    const r = await receitaPorId(chave.slice(8))
    nome = r.nome; imagemUrl = r.imagem; fonte = 'TheMealDB'
  } else return falha(res, 'Referência inválida.')
  const [salvo] = await ReceitaSalva.findOrCreate({ where: { usuarioId: req.usuarioId, chave }, defaults: { nome, imagemUrl, fonte } })
  res.status(201).json({ receita: salvo })
}))
catalogo.delete('/saved/recipes/:chave', autenticar, asyncRoute(async (req, res) => {
  await ReceitaSalva.destroy({ where: { usuarioId: req.usuarioId, chave: req.params.chave } }); res.status(204).end()
}))
