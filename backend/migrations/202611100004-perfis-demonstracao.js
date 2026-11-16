import { DataTypes } from 'sequelize'

// Identifica contas fictícias para não confundi-las com participantes reais.
export async function up(q, transaction) {
  await q.addColumn('usuarios', 'is_demo', {
    type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false,
  }, { transaction })
}
