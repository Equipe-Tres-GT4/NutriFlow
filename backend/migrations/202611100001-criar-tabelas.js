import { DataTypes } from 'sequelize'

/** Migration 001 — esquema base, com chaves estrangeiras e índices de unicidade.
 * Nomes snake_case seguem o define.underscored de src/models.js.
 */
const id = () => ({ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
const obrigatorio = (type) => ({ type, allowNull: false })
const datas = () => ({ created_at: obrigatorio(DataTypes.DATE), updated_at: obrigatorio(DataTypes.DATE) })
const referencia = (table) => ({
  type: DataTypes.INTEGER, allowNull: false,
  references: { model: table, key: 'id' },
  onUpdate: 'CASCADE', onDelete: 'CASCADE',
})

export async function up(q, transaction) {
  const options = { transaction }
  await q.createTable('usuarios', {
    id: id(), nome: obrigatorio(DataTypes.STRING(100)),
    email: { ...obrigatorio(DataTypes.STRING(180)), unique: true },
    senha_hash: obrigatorio(DataTypes.STRING), telefone: DataTypes.STRING(30),
    cep: DataTypes.STRING(9), cidade: DataTypes.STRING(120), uf: DataTypes.STRING(2),
    bairro: DataTypes.STRING(120), logradouro: DataTypes.STRING(160), numero: DataTypes.STRING(20),
    peso: DataTypes.STRING(15), altura: DataTypes.STRING(10), objetivo: DataTypes.STRING(100),
    restricoes: DataTypes.STRING(255), ...datas(),
  }, options)
  await q.createTable('publicacoes', {
    id: id(), titulo: obrigatorio(DataTypes.STRING(140)), conteudo: obrigatorio(DataTypes.TEXT),
    tipo: { type: DataTypes.ENUM('dica', 'receita', 'experiencia'), defaultValue: 'dica' },
    imagem_url: DataTypes.STRING(500), autor_id: referencia('usuarios'), ...datas(),
  }, options)
  await q.createTable('comentarios', {
    id: id(), texto: obrigatorio(DataTypes.STRING(1000)),
    autor_id: referencia('usuarios'), publicacao_id: referencia('publicacoes'), ...datas(),
  }, options)
  await q.createTable('curtidas', {
    id: id(), usuario_id: referencia('usuarios'),
    publicacao_id: referencia('publicacoes'), ...datas(),
  }, options)
  await q.createTable('seguidores', {
    id: id(), seguidor_id: referencia('usuarios'),
    seguido_id: referencia('usuarios'), ...datas(),
  }, options)
  await q.addIndex('curtidas', ['usuario_id', 'publicacao_id'], { unique: true, name: 'curtidas_usuario_publicacao_unique', transaction })
  await q.addIndex('seguidores', ['seguidor_id', 'seguido_id'], { unique: true, name: 'seguidores_seguidor_seguido_unique', transaction })
}
