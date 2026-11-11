import { DataTypes } from 'sequelize'

// Evolucao aditiva: preserva usuarios, receitas, posts, curtidas e comentarios.
export async function up(q, transaction) {
  await q.addColumn('usuarios', 'foto_url', { type: DataTypes.STRING(500) }, { transaction })
  await q.addColumn('receitas', 'video_url', { type: DataTypes.STRING(500) }, { transaction })
  await q.addColumn('receitas', 'foto_credito', { type: DataTypes.TEXT }, { transaction })
  await q.addColumn('receitas', 'receita_original_id', { type: DataTypes.INTEGER, references: { model: 'receitas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' }, { transaction })
  await q.addColumn('publicacoes', 'video_url', { type: DataTypes.STRING(500) }, { transaction })
  await q.addIndex('receitas', ['receita_original_id'], { name: 'receitas_original_idx', transaction })
}
