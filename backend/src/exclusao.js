import { sequelize, Publicacao, Receita, ReceitaSalva, Comentario, Curtida, Denuncia } from './models.js'

/** Exclui publicação e receita vinculada sem deixar favoritos/comentários órfãos.
 * Versões independentes ficam publicadas, porém perdem vínculo com a receita excluída.
 * A fila de moderação preserva o título da denúncia para auditoria.
 */
export async function excluirPublicacaoComDependencias(postId, { moderadorId = null, transaction: transacaoExterna = null } = {}) {
  const executar = async (transaction) => {
    const post = await Publicacao.findByPk(postId, { transaction })
    if (!post) return false
    if (post.receitaId) {
      await ReceitaSalva.destroy({ where: { chave: `local:${post.receitaId}` }, transaction })
      await Receita.update({ receitaOriginalId: null }, { where: { receitaOriginalId: post.receitaId }, transaction })
    }
    await Comentario.destroy({ where: { publicacaoId: post.id }, transaction })
    await Curtida.destroy({ where: { publicacaoId: post.id }, transaction })
    await post.destroy({ transaction })
    if (post.receitaId) await Receita.destroy({ where: { id: post.receitaId }, transaction })
    await Denuncia.update({ status: 'removida', observacaoAdmin: moderadorId ? 'Removida após avaliação da equipe.' : 'Conteúdo excluído pelo próprio autor.', moderadorId, analisadaEm: new Date() }, { where: { tipoAlvo: 'publicacao', alvoId: post.id, status: 'pendente' }, transaction })
    return true
  }
  return transacaoExterna ? executar(transacaoExterna) : sequelize.transaction(executar)
}

export async function excluirReceitaComDependencias(receitaId) {
  const receita = await Receita.findByPk(receitaId)
  if (!receita) return false
  const post = await Publicacao.findOne({ where: { receitaId } })
  if (post) return excluirPublicacaoComDependencias(post.id)
  return sequelize.transaction(async transaction => {
    await ReceitaSalva.destroy({ where: { chave: `local:${receitaId}` }, transaction })
    await Receita.update({ receitaOriginalId: null }, { where: { receitaOriginalId: receitaId }, transaction })
    await receita.destroy({ transaction })
    return true
  })
}
