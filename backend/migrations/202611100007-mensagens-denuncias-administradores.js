import { DataTypes } from 'sequelize'

const id = { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false }
const datas = { created_at: { type: DataTypes.DATE, allowNull: false }, updated_at: { type: DataTypes.DATE, allowNull: false } }

/** Atualização aditiva. Não apaga publicações, contas ou receitas. */
export async function up(q, transaction) {
  await q.addColumn('usuarios', 'papel', { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'usuario' }, { transaction })
  await q.createTable('mensagens', {
    id, remetente_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
    destinatario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
    texto: { type: DataTypes.TEXT, allowNull: false },
    tipo: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'texto' },
    receita_id: DataTypes.INTEGER, titulo_receita: DataTypes.STRING(140),
    lida_em: DataTypes.DATE, ...datas,
  }, { transaction })
  await q.addIndex('mensagens', ['remetente_id', 'destinatario_id', 'created_at'], { transaction, name: 'mensagens_conversa_indice' })
  await q.addIndex('mensagens', ['destinatario_id', 'lida_em'], { transaction, name: 'mensagens_nao_lidas_indice' })
  await q.createTable('denuncias', {
    id, denunciante_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
    tipo_alvo: { type: DataTypes.STRING(15), allowNull: false }, alvo_id: { type: DataTypes.INTEGER, allowNull: false },
    autor_alvo_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
    titulo_snapshot: { type: DataTypes.STRING(140), allowNull: false },
    motivo: { type: DataTypes.STRING(35), allowNull: false }, detalhes: { type: DataTypes.STRING(1200) },
    status: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'pendente' },
    observacao_admin: DataTypes.STRING(1200), moderador_id: DataTypes.INTEGER, analisada_em: DataTypes.DATE,
    ...datas,
  }, { transaction })
  await q.addIndex('denuncias', ['status', 'created_at'], { transaction, name: 'denuncias_pendentes_indice' })
  await q.addIndex('denuncias', ['denunciante_id', 'tipo_alvo', 'alvo_id'], { unique: true, transaction, name: 'denuncia_unica_por_alvo' })
}
