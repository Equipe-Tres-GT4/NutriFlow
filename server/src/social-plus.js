/** Mensagens privadas e moderação: somente participantes da conversa veem o histórico.
 * A verificação de administrador é feita no backend, nunca confiando no React.
 */
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { Op } from 'sequelize'
import { Usuario, Mensagem, Denuncia, Publicacao, Receita, sequelize } from './models.js'
import { autenticar, asyncRoute } from './security.js'
import { excluirPublicacaoComDependencias } from './exclusao.js'

export const socialPlus = Router()
const id = value => /^[1-9]\d{0,9}$/.test(String(value)) ? Number(value) : null
const txt = value => typeof value === 'string' ? value.trim() : ''
const usuarioSeguro = ['id', 'nome', 'fotoUrl', 'isDemo', 'papel']
const erro = (res, status, mensagem) => res.status(status).json({ erro: mensagem })

async function exigirAdmin(req, res, next) {
  const usuario = await Usuario.findByPk(req.usuarioId, { attributes: ['id', 'papel'] })
  if (!usuario || usuario.papel !== 'admin') return erro(res, 403, 'Apenas a equipe de moderação pode acessar esta área.')
  next()
}
const admin = [autenticar, asyncRoute(exigirAdmin)]
const limitarMensagens = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false })
const limitarDenuncias = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false })

socialPlus.get('/messages/unread', autenticar, asyncRoute(async (req, res) => {
  res.json({ naoLidas: await Mensagem.count({ where: { destinatarioId: req.usuarioId, lidaEm: null } }) })
}))
socialPlus.get('/messages/threads', autenticar, asyncRoute(async (req, res) => {
  const rows = await Mensagem.findAll({ where: { [Op.or]: [{ remetenteId: req.usuarioId }, { destinatarioId: req.usuarioId }] }, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 500 })
  const conversas = new Map()
  for (const mensagem of rows) {
    const outroId = mensagem.remetenteId === req.usuarioId ? mensagem.destinatarioId : mensagem.remetenteId
    if (!conversas.has(outroId)) conversas.set(outroId, { usuarioId: outroId, ultimaMensagem: mensagem.texto.slice(0, 120), tipo: mensagem.tipo, enviadaEm: mensagem.createdAt, naoLidas: 0 })
    if (mensagem.destinatarioId === req.usuarioId && !mensagem.lidaEm) conversas.get(outroId).naoLidas += 1
  }
  const pessoas = await Usuario.findAll({ where: { id: { [Op.in]: [...conversas.keys()] } }, attributes: usuarioSeguro })
  const mapa = new Map(pessoas.map(p => [p.id, p.get({ plain: true })]))
  res.json({ conversas: [...conversas.values()].map(c => ({ ...c, usuario: mapa.get(c.usuarioId) })).filter(c => c.usuario) })
}))
socialPlus.get('/messages/:userId', autenticar, asyncRoute(async (req, res) => {
  const outroId = id(req.params.userId)
  const outro = outroId ? await Usuario.findByPk(outroId, { attributes: usuarioSeguro }) : null
  if (!outro || outroId === req.usuarioId) return erro(res, 404, 'Conversa não encontrada.')
  const condicoes = { [Op.or]: [{ remetenteId: req.usuarioId, destinatarioId: outroId }, { remetenteId: outroId, destinatarioId: req.usuarioId }] }
  const mensagens = await Mensagem.findAll({ where: condicoes, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 100 })
  await Mensagem.update({ lidaEm: new Date() }, { where: { remetenteId: outroId, destinatarioId: req.usuarioId, lidaEm: null } })
  res.json({ usuario: outro, mensagens: mensagens.reverse() })
}))
socialPlus.post('/messages', autenticar, limitarMensagens, asyncRoute(async (req, res) => {
  const destinatarioId = id(req.body?.destinatarioId)
  if (!destinatarioId || destinatarioId === req.usuarioId) return erro(res, 400, 'Selecione outro participante.')
  if (!(await Usuario.findByPk(destinatarioId))) return erro(res, 404, 'Participante não encontrado.')
  const receitaId = req.body?.receitaId === undefined || req.body?.receitaId === null ? null : id(req.body.receitaId)
  if (req.body?.receitaId != null && !receitaId) return erro(res, 400, 'Referência de receita inválida.')
  const receita = receitaId ? await Receita.findByPk(receitaId) : null
  if (receitaId && !receita) return erro(res, 404, 'Receita não encontrada.')
  const conteudo = txt(req.body?.texto)
  if (conteudo.length > 2000 || (!conteudo && !receita)) return erro(res, 400, 'Mensagem deve ter de 1 a 2000 caracteres ou compartilhar uma receita.')
  const mensagem = await Mensagem.create({ remetenteId: req.usuarioId, destinatarioId, texto: conteudo || `Compartilhou a receita: ${receita.nome}`, tipo: receita ? 'receita' : 'texto', receitaId, tituloReceita: receita?.nome || null })
  res.status(201).json({ mensagem })
}))

const motivos = ['nao_e_receita', 'conteudo_improprio', 'spam', 'assedio', 'informacao_enganosa', 'outro']
socialPlus.post('/reports', autenticar, limitarDenuncias, asyncRoute(async (req, res) => {
  const tipoAlvo = txt(req.body?.tipoAlvo)
  const alvoId = id(req.body?.alvoId)
  const motivo = txt(req.body?.motivo)
  const detalhes = txt(req.body?.detalhes)
  if (!['publicacao','usuario'].includes(tipoAlvo) || !alvoId || !motivos.includes(motivo) || detalhes.length > 1200) return erro(res, 400, 'Informe conteúdo, motivo e detalhes válidos.')
  const alvo = tipoAlvo === 'publicacao' ? await Publicacao.findByPk(alvoId) : await Usuario.findByPk(alvoId)
  if (!alvo) return erro(res, 404, 'Conteúdo ou perfil não encontrado.')
  const autorAlvoId = tipoAlvo === 'publicacao' ? alvo.autorId : alvo.id
  if (autorAlvoId === req.usuarioId) return erro(res, 400, 'Você não pode denunciar seu próprio conteúdo.')
  const existente = await Denuncia.findOne({ where: { denuncianteId: req.usuarioId, tipoAlvo, alvoId } })
  if (existente) return erro(res, 409, 'Você já denunciou este conteúdo. A equipe analisará a solicitação.')
  const tituloSnapshot = tipoAlvo === 'publicacao' ? alvo.titulo : `Perfil: ${alvo.nome}`
  const denuncia = await Denuncia.create({ denuncianteId: req.usuarioId, tipoAlvo, alvoId, autorAlvoId, tituloSnapshot, motivo, detalhes, status: 'pendente' })
  res.status(201).json({ denuncia: { id: denuncia.id, status: denuncia.status }, mensagem: 'Denúncia registrada. Nossa equipe avaliará o conteúdo.' })
}))
socialPlus.get('/reports/mine', autenticar, asyncRoute(async (req, res) => {
  const denuncias = await Denuncia.findAll({ where: { denuncianteId: req.usuarioId }, attributes: ['id','tipoAlvo','tituloSnapshot','motivo','status','createdAt','analisadaEm'], order: [['createdAt','DESC']], limit: 100 })
  res.json({ denuncias })
}))
socialPlus.get('/admin/reports', ...admin, asyncRoute(async (req, res) => {
  const status = txt(req.query.status) || 'pendente'
  if (!['pendente','mantida','removida','orientada','todos'].includes(status)) return erro(res, 400, 'Status inválido.')
  const where = status === 'todos' ? {} : { status }
  const denuncias = await Denuncia.findAll({ where, include: [
    { model: Usuario, as: 'denunciante', attributes: usuarioSeguro },
    { model: Usuario, as: 'autorAlvo', attributes: usuarioSeguro },
  ], order: [['createdAt','DESC']], limit: 200 })
  const postIds = denuncias.filter(d => d.tipoAlvo === 'publicacao').map(d => d.alvoId)
  const posts = postIds.length ? await Publicacao.findAll({ where: { id: { [Op.in]: postIds } }, attributes: ['id','titulo','conteudo','tipo','imagemUrl','videoUrl','receitaId'], raw: true }) : []
  const mapaPosts = new Map(posts.map(p => [p.id, p]))
  res.json({ denuncias: denuncias.map(d => ({ ...d.get({ plain: true }), publicacao: d.tipoAlvo === 'publicacao' ? mapaPosts.get(d.alvoId) || null : null })), pendentes: await Denuncia.count({ where: { status: 'pendente' } }) })
}))
socialPlus.post('/admin/reports/:id/review', ...admin, asyncRoute(async (req, res) => {
  const denuncia = await Denuncia.findByPk(id(req.params.id))
  if (!denuncia) return erro(res, 404, 'Denúncia não encontrada.')
  if (denuncia.status !== 'pendente') return erro(res, 409, 'Esta denúncia já foi analisada.')
  const acao = txt(req.body?.acao)
  const observacao = txt(req.body?.observacao)
  if (!['manter','remover','orientar'].includes(acao) || observacao.length < 10 || observacao.length > 1200) return erro(res, 400, 'Escolha manter ou remover e explique a decisão (10–1200 caracteres).')
  if (acao === 'orientar' && denuncia.tipoAlvo !== 'usuario') return erro(res, 400, 'A orientação de perfil é aplicada apenas a denúncias de usuários.')
  if (acao === 'remover' && denuncia.tipoAlvo !== 'publicacao') return erro(res, 400, 'A exclusão automática só é permitida para publicações. Denúncias de perfil devem ser analisadas e mantidas ou encaminhadas para suporte.')
  const relacionadas = acao === 'remover' ? await Denuncia.findAll({ where: { tipoAlvo: 'publicacao', alvoId: denuncia.alvoId, status: 'pendente' } }) : [denuncia]
  await sequelize.transaction(async transaction => {
    if (acao === 'remover') await excluirPublicacaoComDependencias(denuncia.alvoId, { moderadorId: req.usuarioId, transaction })
    const statusFinal = acao === 'remover' ? 'removida' : acao === 'orientar' ? 'orientada' : 'mantida'
    for (const d of relacionadas) {
      await d.update({ status: statusFinal, observacaoAdmin: observacao, moderadorId: req.usuarioId, analisadaEm: new Date() }, { transaction })
    }
    const nomeAcao = acao === 'remover' ? 'foi removido' : acao === 'orientar' ? 'foi analisado e a equipe enviou orientações ao responsável' : 'foi analisado e permanecerá disponível'
    // Cada denunciante recebe retorno, inclusive quando vários denunciaram o mesmo post.
    for (const d of relacionadas) {
      await Mensagem.create({
        remetenteId: req.usuarioId, destinatarioId: d.denuncianteId,
        texto: `Equipe NutriFlow · Sua denúncia #${d.id} sobre “${d.tituloSnapshot}” foi analisada. O conteúdo ${nomeAcao}. Resposta: ${observacao}`.slice(0, 2000), tipo: 'moderacao',
      }, { transaction })
    }
    // Autor recebe uma única mensagem, sem nomes de denunciantes.
    await Mensagem.create({
      remetenteId: req.usuarioId, destinatarioId: denuncia.autorAlvoId,
      texto: `Equipe NutriFlow · Um conteúdo associado à sua conta (“${denuncia.tituloSnapshot}”) ${nomeAcao} após análise da moderação. Orientação: ${observacao}. Você pode responder a esta mensagem.`.slice(0, 2000), tipo: 'moderacao',
    }, { transaction })
  })
  res.json({ mensagem: 'Decisão registrada. O feedback foi enviado por mensagem privada ao autor e ao denunciante.', status: acao === 'remover' ? 'removida' : acao === 'orientar' ? 'orientada' : 'mantida' })
}))
