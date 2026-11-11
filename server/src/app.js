import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcrypt'
import { Op, literal } from 'sequelize'
import swaggerUi from 'swagger-ui-express'
import { Usuario, Publicacao, Comentario, Curtida, Seguidor, Receita, ReceitaSalva, usuarioPublico } from './models.js'
import { autenticar, gerarToken, definirCookie, limparCookie, asyncRoute } from './security.js'
import { cepValido, codigoBarrasValido, emailValido, nomeValido, imagemUrlValida, somenteDigitos } from './normalize.js'
import { fontes, produtoPorCodigo, buscarProdutos, buscarReceitas, receitaPorId, receitaAleatoria, enderecoPorCep, listarEstadosComFonte, listarCidadesComFonte } from './external.js'
import { openapi } from './swagger.js'
import { verificarOrigem, tratarErro } from './middlewares.js'
import { catalogo } from './catalogo.js'
import { registrarMidia } from './upload.js'
import { socialPlus } from './social-plus.js'
import { excluirPublicacaoComDependencias } from './exclusao.js'
import { limiteGeral, limiteAutenticacao, ignorarLimiteAutenticacao } from './limites.js'

const app = express()
app.disable('x-powered-by')
app.use(helmet({ contentSecurityPolicy: false })) // Swagger UI hospeda seus próprios assets
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(x => x.trim()) || ['http://localhost:5173'], credentials: true }))
app.use(express.json({ limit: '120kb' }))
app.use(cookieParser())
app.use('/api', rateLimit({ windowMs: 60_000, limit: limiteGeral(), standardHeaders: 'draft-7', legacyHeaders: false }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: limiteAutenticacao(), skip: ignorarLimiteAutenticacao, standardHeaders: 'draft-7', legacyHeaders: false }))
app.use(verificarOrigem)
const erro400 = (res, mensagem) => res.status(400).json({ erro: mensagem })
const inteiroId = (valor) => /^[1-9]\d{0,9}$/.test(String(valor)) ? Number(valor) : null
const texto = (v) => typeof v === 'string' ? v.trim() : ''
const selecionar = (origem, campos) => Object.fromEntries(campos.filter(c => Object.hasOwn(origem, c)).map(c => [c, origem[c]]))

app.get('/', (_req, res) => res.redirect('/api/docs'))
app.get('/api/health', (_req, res) => res.json({ status: 'ok', projeto: 'NutriFlow', data: new Date().toISOString() }))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'NutriFlow — Swagger API' }))
app.get('/api/openapi.json', (_req, res) => res.json(openapi))
registrarMidia(app)

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { nome, email, senha } = req.body || {}
  if (!nomeValido(nome, 2, 100) || !emailValido(email) || typeof senha !== 'string' || senha.length < 8 || senha.length > 72) return erro400(res, 'Informe nome, e-mail e senha entre 8 e 72 caracteres.')
  const emailLimpo = email.trim().toLowerCase()
  if (await Usuario.findOne({ where: { email: emailLimpo } })) return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' })
  const endereco = selecionar(req.body || {}, ['cep','logradouro','numero','bairro','cidade','uf'])
  if (Object.entries(endereco).some(([k,v]) => typeof v !== 'string' || v.length > (k === 'logradouro' ? 160 : 120)) || (endereco.cep && !cepValido(endereco.cep)) || (endereco.uf && !/^[a-zA-Z]{2}$/.test(endereco.uf))) return erro400(res, 'Dados de localização inválidos.')
  if (endereco.cep) endereco.cep = somenteDigitos(endereco.cep)
  const usuario = await Usuario.create({ nome: nome.trim(), email: emailLimpo, senhaHash: await bcrypt.hash(senha, 12), objetivo: 'Saúde e Longevidade', ...endereco })
  definirCookie(res, gerarToken(usuario.id))
  res.status(201).json({ usuario: usuarioPublico(usuario) })
}))
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const email = texto(req.body?.email).toLowerCase()
  const usuario = await Usuario.findOne({ where: { email } })
  if (!usuario || typeof req.body?.senha !== 'string' || !(await bcrypt.compare(req.body.senha, usuario.senhaHash))) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' })
  definirCookie(res, gerarToken(usuario.id))
  res.json({ usuario: usuarioPublico(usuario) })
}))
app.post('/api/auth/logout', (_req, res) => { limparCookie(res); res.json({ mensagem: 'Sessão encerrada.' }) })
app.get('/api/auth/me', autenticar, asyncRoute(async (req, res) => {
  const usuario = await Usuario.findByPk(req.usuarioId)
  if (!usuario) return res.status(401).json({ erro: 'Usuário inexistente.' })
  res.json({ usuario: usuarioPublico(usuario) })
}))
app.patch('/api/profile', autenticar, asyncRoute(async (req, res) => {
  const permitidos = ['nome', 'telefone', 'cep', 'cidade', 'uf', 'bairro', 'logradouro', 'numero', 'peso', 'altura', 'objetivo', 'restricoes', 'fotoUrl']
  const dados = selecionar(req.body || {}, permitidos)
  if (dados.fotoUrl && (!imagemUrlValida(dados.fotoUrl) || !/(\.jpg|\.jpeg|\.webp|\.png)(?:$|\?)/i.test(dados.fotoUrl))) return erro400(res, 'Imagem de perfil inválida.')
  if (dados.nome !== undefined && !nomeValido(dados.nome, 2, 100)) return erro400(res, 'Nome inválido.')
  if (dados.cep && !cepValido(dados.cep)) return erro400(res, 'CEP inválido.')
  if (dados.uf && !/^[a-zA-Z]{2}$/.test(dados.uf)) return erro400(res, 'UF inválida.')
  if (Object.entries(dados).some(([k, v]) => typeof v !== 'string' || v.length > (k === 'fotoUrl' ? 500 : k === 'restricoes' ? 255 : 160))) return erro400(res, 'Dados de perfil inválidos.')
  if (dados.cep) dados.cep = somenteDigitos(dados.cep)
  const usuario = await Usuario.findByPk(req.usuarioId)
  if (!usuario) return res.status(404).json({ erro: 'Conta não encontrada.' })
  await usuario.update(dados)
  res.json({ usuario: usuarioPublico(usuario) })
}))

// Feed com dados reais do banco. "Mais salvas" e "Populares" ordenam por
// interações registradas; o conteúdo demonstrativo é claramente identificado.
const formatarPost = async (post, usuarioId) => {
  const p = post.get({ plain: true })
  const chave = p.receitaId ? `local:${p.receitaId}` : null
  const [totalCurtidas, totalComentarios, curtido, totalSalvos, salvo, seguindoAutor] = await Promise.all([
    Curtida.count({ where: { publicacaoId: p.id } }),
    Comentario.count({ where: { publicacaoId: p.id } }),
    usuarioId ? Curtida.count({ where: { publicacaoId: p.id, usuarioId } }) : 0,
    chave ? ReceitaSalva.count({ where: { chave } }) : 0,
    chave && usuarioId ? ReceitaSalva.count({ where: { chave, usuarioId } }) : 0,
    usuarioId && p.autorId !== usuarioId ? Seguidor.count({ where: { seguidorId: usuarioId, seguidoId: p.autorId } }) : 0,
  ])
  return {
    ...p,
    autor: p.autor ? {
      id: p.autor.id, nome: p.autor.nome, isDemo: Boolean(p.autor.isDemo),
      especialidade: p.autor.isDemo ? p.autor.objetivo : null, fotoUrl: p.autor.fotoUrl || null,
    } : null,
    receita: p.receita ? { tempoMin: p.receita.tempoMin, porcoes: p.receita.porcoes, resumo: p.receita.resumo, dificuldade: p.receita.dificuldade, videoUrl: p.receita.videoUrl, receitaOriginalId: p.receita.receitaOriginalId, fotoCredito: p.receita.fotoCredito ? JSON.parse(p.receita.fotoCredito) : null } : null,
    totalCurtidas, totalComentarios, curtido: Boolean(curtido),
    totalSalvos, salvo: Boolean(salvo), seguindoAutor: Boolean(seguindoAutor),
  }
}
const usuarioOpcional = async (req) => {
  // O cookie é validado apenas nas rotas autenticadas. Não vazar identidade de cookies inválidos.
  if (!req.cookies?.nf_token) return null
  const jwt = await import('jsonwebtoken')
  try { return Number(jwt.default.verify(req.cookies.nf_token, process.env.JWT_SECRET, { issuer: 'nutriflow' }).sub) } catch { return null }
}
app.get('/api/community/authors', asyncRoute(async (_req, res) => {
  const ids = [...new Set((await Receita.findAll({ attributes: ['autorId'], group: ['autorId'], raw: true })).map(r => r.autorId))]
  if (!ids.length) return res.json({ autores: [] })
  const usuarios = await Usuario.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'nome', 'objetivo', 'isDemo', 'fotoUrl'], order: [['nome', 'ASC']] })
  const autores = await Promise.all(usuarios.map(async u => ({
    id: u.id, nome: u.nome, isDemo: Boolean(u.isDemo), fotoUrl: u.fotoUrl,
    especialidade: u.isDemo ? u.objetivo : null,
    totalReceitas: await Receita.count({ where: { autorId: u.id } }),
  })))
  res.json({ autores })
}))
app.get('/api/posts', asyncRoute(async (req, res) => {
  const page = Math.max(1, Math.min(Number(req.query.page) || 1, 100))
  const busca = texto(req.query.q).slice(0, 80)
  const tipo = texto(req.query.tipo) || 'todos'
  if (!['receita', 'dica', 'experiencia', 'todos'].includes(tipo)) return erro400(res, 'Filtro de categoria inválido.')
  const sort = texto(req.query.sort) || 'recentes'
  if (!['recentes', 'populares', 'salvas'].includes(sort)) return erro400(res, 'Ordenação inválida.')
  const feed = texto(req.query.feed) || 'todos'
  if (!['todos', 'seguindo', 'seguidores', 'amigos'].includes(feed)) return erro400(res, 'Filtro de feed inválido.')
  const autor = texto(req.query.autor)
  if (autor && !inteiroId(autor)) return erro400(res, 'Autor inválido.')
  const where = {
    ...(tipo !== 'todos' ? { tipo } : {}),
    ...(autor ? { autorId: Number(autor) } : {}),
    ...(busca ? { [Op.or]: [
      { titulo: { [Op.like]: `%${busca}%` } },
      { conteudo: { [Op.like]: `%${busca}%` } },
      { '$autor.nome$': { [Op.like]: `%${busca}%` } },
    ] } : {}),
  }
  const usuarioId = await usuarioOpcional(req)
  if (feed !== 'todos') {
    if (!usuarioId) return res.status(401).json({ erro: 'Entre para ver as publicações de quem você segue.' })
    const seguindo = await Seguidor.findAll({ where: { seguidorId: usuarioId }, attributes: ['seguidoId'], raw: true })
    let ids = seguindo.map(c => c.seguidoId)
    if (feed === 'seguidores') {
      const seguidores = await Seguidor.findAll({ where: { seguidoId: usuarioId }, attributes: ['seguidorId'], raw: true })
      ids = seguidores.map(c => c.seguidorId)
    }
    if (feed === 'amigos' && ids.length) {
      const retribuidos = await Seguidor.findAll({ where: { seguidoId: usuarioId, seguidorId: { [Op.in]: ids } }, attributes: ['seguidorId'], raw: true })
      ids = retribuidos.map(c => c.seguidorId)
    }
    // Filtro também funciona quando ninguém está sendo seguido (IN vazio retorna nenhum resultado).
    where.autorId = { [Op.in]: autor ? ids.filter(id => id === Number(autor)) : ids }
  }
  if (req.query.salvas === 'minhas') {
    if (!usuarioId) return res.status(401).json({ erro: 'Entre na sua conta para ver receitas salvas.' })
    const salvas = await ReceitaSalva.findAll({ where: { usuarioId, chave: { [Op.like]: 'local:%' } }, attributes: ['chave'] })
    const ids = salvas.map(s => Number(s.chave.slice(6))).filter(Number.isSafeInteger)
    where.receitaId = { [Op.in]: ids }
  }
  const order = sort === 'populares'
    ? [[literal('(SELECT COUNT(*) FROM curtidas WHERE curtidas.publicacao_id = Publicacao.id)'), 'DESC'], ['createdAt', 'DESC']]
    : sort === 'salvas'
      ? [[literal("(SELECT COUNT(*) FROM receitas_salvas WHERE receitas_salvas.chave = ('local:' || Publicacao.receita_id))"), 'DESC'], ['createdAt', 'DESC']]
      : [['createdAt', 'DESC']]
  const { rows, count } = await Publicacao.findAndCountAll({
    where,
    include: [
      { model: Usuario, as: 'autor', attributes: ['id', 'nome', 'objetivo', 'isDemo', 'fotoUrl'] },
      { model: Receita, as: 'receita', attributes: ['id', 'tempoMin', 'porcoes', 'resumo', 'dificuldade', 'videoUrl', 'receitaOriginalId', 'fotoCredito'], required: false },
    ],
    subQuery: false, order, limit: 12, offset: (page - 1) * 12,
  })
  res.json({ publicacoes: await Promise.all(rows.map(r => formatarPost(r, usuarioId))), total: count, pagina: page })
}))
app.get('/api/posts/:id', asyncRoute(async (req, res) => {
  const id = inteiroId(req.params.id)
  if (!id) return erro400(res, 'ID inválido.')
  const post = await Publicacao.findByPk(id, { include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nome', 'objetivo', 'isDemo', 'fotoUrl'] }, { model: Receita, as: 'receita', attributes: ['id','tempoMin','porcoes','resumo','dificuldade','videoUrl','receitaOriginalId','fotoCredito'] }] })
  if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' })
  res.json({ publicacao: await formatarPost(post, await usuarioOpcional(req)) })
}))
app.post('/api/posts', autenticar, asyncRoute(async (req, res) => {
  const titulo = texto(req.body?.titulo), conteudo = texto(req.body?.conteudo), tipo = texto(req.body?.tipo) || 'dica', imagemUrl = texto(req.body?.imagemUrl), videoUrl = texto(req.body?.videoUrl)
  if (!nomeValido(titulo, 3, 140) || !nomeValido(conteudo, 10, 5000) || !['dica', 'receita', 'experiencia'].includes(tipo) || !imagemUrlValida(imagemUrl) || !imagemUrlValida(videoUrl)) return erro400(res, 'Informe título (3-140), conteúdo (10-5000), tipo válido e URL HTTP(S) de imagem opcional.')
  const post = await Publicacao.create({ titulo, conteudo, tipo, imagemUrl: imagemUrl || null, videoUrl: videoUrl || null, autorId: req.usuarioId })
  res.status(201).json({ publicacao: { id: post.id } })
}))
app.put('/api/posts/:id', autenticar, asyncRoute(async (req, res) => {
  const post = await Publicacao.findByPk(inteiroId(req.params.id))
  if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' })
  if (post.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Você só pode editar suas publicações.' })
  if (post.receitaId) return res.status(409).json({ erro: 'Esta publicação pertence a uma receita. Edite na página de receitas.' })
  const { titulo, conteudo, tipo, imagemUrl, videoUrl } = { ...post.get({ plain: true }), ...selecionar(req.body || {}, ['titulo', 'conteudo', 'tipo', 'imagemUrl', 'videoUrl']) }
  if (!nomeValido(titulo, 3, 140) || !nomeValido(conteudo, 10, 5000) || !['dica','receita','experiencia'].includes(tipo) || !imagemUrlValida(imagemUrl) || !imagemUrlValida(videoUrl)) return erro400(res, 'Dados de publicação inválidos.')
  await post.update({ titulo: titulo.trim(), conteudo: conteudo.trim(), tipo, imagemUrl, videoUrl })
  res.json({ mensagem: 'Publicação atualizada.' })
}))
app.delete('/api/posts/:id', autenticar, asyncRoute(async (req, res) => {
  const post = await Publicacao.findByPk(inteiroId(req.params.id))
  if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' })
  if (post.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Você só pode excluir suas publicações.' })
  await excluirPublicacaoComDependencias(post.id)
  res.status(204).end()
}))
app.post('/api/posts/:id/like', autenticar, asyncRoute(async (req, res) => {
  const id = inteiroId(req.params.id)
  if (!id || !(await Publicacao.findByPk(id))) return res.status(404).json({ erro: 'Publicação não encontrada.' })
  const where = { usuarioId: req.usuarioId, publicacaoId: id }
  const atual = await Curtida.findOne({ where })
  if (atual) await atual.destroy(); else await Curtida.create(where)
  res.json({ curtido: !atual, totalCurtidas: await Curtida.count({ where: { publicacaoId: id } }) })
}))
app.get('/api/posts/:id/comments', asyncRoute(async (req, res) => {
  const id = inteiroId(req.params.id)
  if (!id || !(await Publicacao.findByPk(id))) return res.status(404).json({ erro: 'Publicação não encontrada.' })
  const comentarios = await Comentario.findAll({ where: { publicacaoId: id }, include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nome', 'fotoUrl', 'isDemo'] }], order: [['createdAt','ASC']], limit: 100 })
  res.json({ comentarios })
}))
app.post('/api/posts/:id/comments', autenticar, asyncRoute(async (req, res) => {
  const id = inteiroId(req.params.id), textoComentario = texto(req.body?.texto)
  if (!id || !(await Publicacao.findByPk(id))) return res.status(404).json({ erro: 'Publicação não encontrada.' })
  if (!nomeValido(textoComentario, 2, 1000)) return erro400(res, 'Comentário deve ter entre 2 e 1000 caracteres.')
  const comentario = await Comentario.create({ texto: textoComentario, autorId: req.usuarioId, publicacaoId: id })
  res.status(201).json({ comentario: { id: comentario.id, texto: comentario.texto } })
}))
app.delete('/api/comments/:id', autenticar, asyncRoute(async (req, res) => {
  const comentario = await Comentario.findByPk(inteiroId(req.params.id))
  if (!comentario) return res.status(404).json({ erro: 'Comentário não encontrado.' })
  if (comentario.autorId !== req.usuarioId) return res.status(403).json({ erro: 'Você só pode excluir seu comentário.' })
  await comentario.destroy(); res.status(204).end()
}))
// Relações sociais persistidas na tabela existente "seguidores"; nenhuma migração destrutiva.
const listaPessoas = async (usuarios, eu) => {
  const ids = usuarios.map(u => u.id)
  const [seguindo, meSeguem] = eu && ids.length ? await Promise.all([
    Seguidor.findAll({ where: { seguidorId: eu, seguidoId: { [Op.in]: ids } }, attributes: ['seguidoId'], raw: true }),
    Seguidor.findAll({ where: { seguidoId: eu, seguidorId: { [Op.in]: ids } }, attributes: ['seguidorId'], raw: true }),
  ]) : [[], []]
  const sigoIds = new Set(seguindo.map(c => c.seguidoId))
  const seguemIds = new Set(meSeguem.map(c => c.seguidorId))
  return Promise.all(usuarios.map(async u => ({
    id: u.id, nome: u.nome, fotoUrl: u.fotoUrl, isDemo: Boolean(u.isDemo),
    objetivo: u.isDemo ? u.objetivo : null,
    seguindo: sigoIds.has(u.id), meSegue: seguemIds.has(u.id),
    amigos: sigoIds.has(u.id) && seguemIds.has(u.id),
    seguidores: await Seguidor.count({ where: { seguidoId: u.id } }),
    totalReceitas: await Receita.count({ where: { autorId: u.id } }),
  })))
}

app.get('/api/social/summary', autenticar, asyncRoute(async (req, res) => {
  const [seguindo, seguidores, amigos] = await Promise.all([
    Seguidor.count({ where: { seguidorId: req.usuarioId } }),
    Seguidor.count({ where: { seguidoId: req.usuarioId } }),
    // Amizades: relações mútuas, sem duplicar registros.
    Seguidor.findAll({ where: { seguidorId: req.usuarioId }, attributes: ['seguidoId'], raw: true })
      .then(async relacoes => relacoes.length ? Seguidor.count({ where: { seguidoId: req.usuarioId, seguidorId: { [Op.in]: relacoes.map(r => r.seguidoId) } } }) : 0),
  ])
  res.json({ seguindo, seguidores, amigos })
}))

app.get('/api/social/connections', autenticar, asyncRoute(async (req, res) => {
  const tipo = texto(req.query.tipo) || 'seguindo'
  if (!['seguindo', 'seguidores', 'amigos'].includes(tipo)) return erro400(res, 'Tipo de conexão inválido.')
  const page = Math.max(1, Math.min(100, Number(req.query.page) || 1))
  const minhas = await Seguidor.findAll({ where: { seguidorId: req.usuarioId }, attributes: ['seguidoId'], raw: true })
  const pessoasQueSigo = minhas.map(r => r.seguidoId)
  const recebidas = await Seguidor.findAll({ where: { seguidoId: req.usuarioId }, attributes: ['seguidorId'], raw: true })
  const quemMeSegue = recebidas.map(r => r.seguidorId)
  const ids = tipo === 'seguindo' ? pessoasQueSigo : tipo === 'seguidores' ? quemMeSegue : pessoasQueSigo.filter(id => quemMeSegue.includes(id))
  const total = ids.length
  const usuarios = total ? await Usuario.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'nome', 'fotoUrl', 'isDemo', 'objetivo'], order: [['nome', 'ASC']], limit: 20, offset: (page - 1) * 20 }) : []
  res.json({ pessoas: await listaPessoas(usuarios, req.usuarioId), total, pagina: page, tipo })
}))

app.get('/api/social/people', autenticar, asyncRoute(async (req, res) => {
  const q = texto(req.query.q).slice(0, 80)
  const page = Math.max(1, Math.min(100, Number(req.query.page) || 1))
  const where = { id: { [Op.ne]: req.usuarioId }, ...(q ? { nome: { [Op.like]: `%${q}%` } } : {}) }
  const { rows, count } = await Usuario.findAndCountAll({ where, attributes: ['id','nome','fotoUrl','isDemo','objetivo'], order: [['nome', 'ASC']], limit: 20, offset: (page - 1) * 20 })
  const pessoas = await listaPessoas(rows, req.usuarioId)
  // Recomendações: contas ainda não seguidas aparecem antes, sem usar dados pessoais de saúde.
  if (!q) pessoas.sort((a, b) => Number(a.seguindo) - Number(b.seguindo) || b.totalReceitas - a.totalReceitas || a.nome.localeCompare(b.nome))
  res.json({ pessoas, total: count, pagina: page })
}))

app.get('/api/users/:id', asyncRoute(async (req, res) => {
  const usuario = await Usuario.findByPk(inteiroId(req.params.id), { attributes: ['id', 'nome', 'createdAt', 'isDemo', 'objetivo', 'fotoUrl'] })
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' })
  const eu = await usuarioOpcional(req)
  const [seguidores, seguindo, totalReceitas, euSigo, meSegue] = await Promise.all([
    Seguidor.count({ where: { seguidoId: usuario.id } }),
    Seguidor.count({ where: { seguidorId: usuario.id } }),
    Receita.count({ where: { autorId: usuario.id } }),
    eu ? Seguidor.count({ where: { seguidorId: eu, seguidoId: usuario.id } }) : 0,
    eu ? Seguidor.count({ where: { seguidoId: eu, seguidorId: usuario.id } }) : 0,
  ])
  res.json({ usuario: { id: usuario.id, nome: usuario.nome, createdAt: usuario.createdAt, isDemo: Boolean(usuario.isDemo), fotoUrl: usuario.fotoUrl, especialidade: usuario.isDemo ? usuario.objetivo : null }, seguidores, seguindo, totalReceitas, euSigo: Boolean(euSigo), meSegue: Boolean(meSegue), amigos: Boolean(euSigo && meSegue) })
}))

async function atualizarSeguimento(req, res, acao) {
  const id = inteiroId(req.params.id)
  if (!id || !(await Usuario.findByPk(id))) return res.status(404).json({ erro: 'Participante não encontrado.' })
  if (id === req.usuarioId) return erro400(res, 'Você não pode seguir seu próprio perfil.')
  const where = { seguidorId: req.usuarioId, seguidoId: id }
  const atual = await Seguidor.findOne({ where })
  const seguir = acao === 'alternar' ? !atual : acao === 'seguir'
  if (seguir && !atual) await Seguidor.findOrCreate({ where })
  if (!seguir && atual) await atual.destroy()
  const [seguidores, meSegue] = await Promise.all([
    Seguidor.count({ where: { seguidoId: id } }),
    Seguidor.count({ where: { seguidorId: id, seguidoId: req.usuarioId } }),
  ])
  res.json({ seguindo: seguir, seguidores, meSegue: Boolean(meSegue), amigos: Boolean(seguir && meSegue) })
}
app.put('/api/users/:id/follow', autenticar, asyncRoute((req, res) => atualizarSeguimento(req, res, 'seguir')))
app.delete('/api/users/:id/follow', autenticar, asyncRoute((req, res) => atualizarSeguimento(req, res, 'deixar')))
// Mantido para compatibilidade com versões anteriores do frontend.
app.post('/api/users/:id/follow', autenticar, asyncRoute((req, res) => atualizarSeguimento(req, res, 'alternar')))

app.use('/api', socialPlus)
app.use('/api', catalogo)
app.get('/api/integrations/sources', (_req, res) => res.json({ fontes }))
app.get('/api/integrations/foods/search', asyncRoute(async (req, res) => {
  const q = texto(req.query.q)
  if (!nomeValido(q, 2, 80)) return erro400(res, 'Busca entre 2 e 80 caracteres.')
  res.json({ produtos: await buscarProdutos(q), fonte: 'Open Food Facts' })
}))
app.get('/api/integrations/foods/:barcode', asyncRoute(async (req, res) => {
  if (!codigoBarrasValido(req.params.barcode)) return erro400(res, 'Código de barras deve ter de 8 a 14 dígitos.')
  res.json({ produto: await produtoPorCodigo(somenteDigitos(req.params.barcode)) })
}))
app.get('/api/integrations/recipes/search', asyncRoute(async (req, res) => {
  const q = texto(req.query.q)
  if (!nomeValido(q, 2, 80)) return erro400(res, 'Busca entre 2 e 80 caracteres.')
  res.json({ receitas: await buscarReceitas(q), fonte: 'TheMealDB' })
}))
app.get('/api/integrations/recipes/random', asyncRoute(async (_req, res) => res.json({ receita: await receitaAleatoria() })))
app.get('/api/integrations/recipes/:id', asyncRoute(async (req, res) => {
  if (!/^\d{1,12}$/.test(req.params.id)) return erro400(res, 'ID de receita inválido.')
  res.json({ receita: await receitaPorId(req.params.id) })
}))
app.get('/api/integrations/location/cep/:cep', asyncRoute(async (req, res) => {
  if (!cepValido(req.params.cep)) return erro400(res, 'Informe um CEP com 8 dígitos.')
  res.json({ endereco: await enderecoPorCep(req.params.cep) })
}))
app.get('/api/integrations/location/states', asyncRoute(async (_req, res) => res.json(await listarEstadosComFonte())))
app.get('/api/integrations/location/states/:uf/cities', asyncRoute(async (req, res) => {
  if (!/^[A-Z]{2}$/i.test(req.params.uf)) return erro400(res, 'UF inválida.')
  res.json(await listarCidadesComFonte(req.params.uf.toUpperCase()))
}))
app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }))
app.use(tratarErro)
export default app
