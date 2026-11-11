import { DataTypes } from 'sequelize'

/** Campos novos, opcionais, preservando todas as receitas antigas. */
export async function up(q, transaction) {
  await q.addColumn('receitas', 'resumo', { type: DataTypes.STRING(450), allowNull: true }, { transaction })
  await q.addColumn('receitas', 'porcoes', { type: DataTypes.INTEGER, allowNull: true }, { transaction })
}
