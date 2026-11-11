import { DataTypes } from 'sequelize'
const id = () => ({ type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true })
const datas = () => ({ created_at: { type: DataTypes.DATE, allowNull: false }, updated_at: { type: DataTypes.DATE, allowNull: false } })
const usuarioId = () => ({ type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
export async function up(q, transaction) {
  const opts = { transaction }
  await q.createTable('alimentos', {
    id: id(), nome: { type: DataTypes.STRING(140), allowNull: false }, marca: DataTypes.STRING(100),
    codigo_barras: DataTypes.STRING(14), imagem_url: DataTypes.STRING(500),
    calorias100g: DataTypes.FLOAT, proteinas100g: DataTypes.FLOAT,
    carboidratos100g: DataTypes.FLOAT, gorduras100g: DataTypes.FLOAT,
    autor_id: usuarioId(), ...datas(),
  }, opts)
  await q.createTable('alimentos_salvos', {
    id: id(), usuario_id: usuarioId(), chave: { type: DataTypes.STRING(60), allowNull: false },
    nome: { type: DataTypes.STRING(140), allowNull: false }, marca: DataTypes.STRING(100),
    imagem_url: DataTypes.STRING(500), fonte: DataTypes.STRING(40), ...datas(),
  }, opts)
  await q.addIndex('alimentos_salvos', ['usuario_id','chave'], { unique: true, name: 'alimentos_salvos_usuario_chave', transaction })
  await q.createTable('receitas', {
    id: id(), nome: { type: DataTypes.STRING(140), allowNull: false },
    tempo_min: DataTypes.INTEGER, dificuldade: DataTypes.STRING(20),
    ingredientes: { type: DataTypes.TEXT, allowNull: false }, preparo: { type: DataTypes.TEXT, allowNull: false },
    imagem_url: DataTypes.STRING(500), autor_id: usuarioId(), ...datas(),
  }, opts)
  await q.createTable('receitas_salvas', {
    id: id(), usuario_id: usuarioId(), chave: { type: DataTypes.STRING(50), allowNull: false },
    nome: { type: DataTypes.STRING(140), allowNull: false }, imagem_url: DataTypes.STRING(500),
    fonte: DataTypes.STRING(40), ...datas(),
  }, opts)
  await q.addIndex('receitas_salvas', ['usuario_id','chave'], { unique: true, name: 'receitas_salvas_usuario_chave', transaction })
}
