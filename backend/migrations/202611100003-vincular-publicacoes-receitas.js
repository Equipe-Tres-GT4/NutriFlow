import { DataTypes } from 'sequelize'
export async function up(q, transaction) {
  await q.addColumn('publicacoes', 'receita_id', { type: DataTypes.INTEGER, allowNull: true }, { transaction })
  await q.addIndex('publicacoes', ['receita_id'], { name: 'publicacoes_receita_id_idx', transaction })
}
