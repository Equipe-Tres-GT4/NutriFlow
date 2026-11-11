import "dotenv/config"
import { Sequelize, DataTypes } from 'sequelize'
import path from 'node:path'
import fs from 'node:fs'

const storage = process.env.DB_STORAGE || path.resolve('data/nutriflow.sqlite')
if (storage !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(storage)), { recursive: true })
export const sequelize = new Sequelize({
  dialect: 'sqlite', storage, logging: false,
  define: { underscored: true }
})
export const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING(100), allowNull: false },
  isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  papel: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'usuario' },
  fotoUrl: DataTypes.STRING(500),
  email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  senhaHash: { type: DataTypes.STRING, allowNull: false },
  telefone: DataTypes.STRING(30),
  cep: DataTypes.STRING(9),
  cidade: DataTypes.STRING(120),
  uf: DataTypes.STRING(2),
  bairro: DataTypes.STRING(120),
  logradouro: DataTypes.STRING(160),
  numero: DataTypes.STRING(20),
  peso: DataTypes.STRING(15),
  altura: DataTypes.STRING(10),
  objetivo: DataTypes.STRING(100),
  restricoes: DataTypes.STRING(255),
}, { tableName: 'usuarios' })
export const Publicacao = sequelize.define('Publicacao', {
  titulo: { type: DataTypes.STRING(140), allowNull: false },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  tipo: { type: DataTypes.ENUM('dica', 'receita', 'experiencia'), defaultValue: 'dica' },
  imagemUrl: DataTypes.STRING(500),
  videoUrl: DataTypes.STRING(500),
}, { tableName: 'publicacoes' })
export const Comentario = sequelize.define('Comentario', {
  texto: { type: DataTypes.STRING(1000), allowNull: false },
}, { tableName: 'comentarios' })
export const Curtida = sequelize.define('Curtida', {}, { tableName: 'curtidas', indexes: [{ unique: true, fields: ['usuario_id', 'publicacao_id'] }] })
export const Seguidor = sequelize.define('Seguidor', {}, { tableName: 'seguidores', indexes: [{ unique: true, fields: ['seguidor_id', 'seguido_id'] }] })

Usuario.hasMany(Publicacao, { foreignKey: { name: 'autorId', allowNull: false }, as: 'publicacoes' })
Publicacao.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' })
Usuario.hasMany(Comentario, { foreignKey: { name: 'autorId', allowNull: false } })
Comentario.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' })
Publicacao.hasMany(Comentario, { foreignKey: { name: 'publicacaoId', allowNull: false }, as: 'comentarios', onDelete: 'CASCADE' })
Comentario.belongsTo(Publicacao, { foreignKey: 'publicacaoId' })
Usuario.hasMany(Curtida, { foreignKey: { name: 'usuarioId', allowNull: false } })
Publicacao.hasMany(Curtida, { foreignKey: { name: 'publicacaoId', allowNull: false }, as: 'curtidas', onDelete: 'CASCADE' })
Curtida.belongsTo(Usuario, { foreignKey: 'usuarioId' })
Curtida.belongsTo(Publicacao, { foreignKey: 'publicacaoId' })
Seguidor.belongsTo(Usuario, { as: 'seguidor', foreignKey: { name: 'seguidorId', allowNull: false } })
Seguidor.belongsTo(Usuario, { as: 'seguido', foreignKey: { name: 'seguidoId', allowNull: false } })

export const usuarioPublico = (usuario) => {
  if (!usuario) return null
  const u = usuario.get ? usuario.get({ plain: true }) : usuario
  const { senhaHash: _omit, ...resto } = u
  return resto
}

// Conteúdo alimentar persistido: separado do catálogo externo e dos rascunhos no navegador.
export const Alimento = sequelize.define('Alimento', {
  nome: { type: DataTypes.STRING(140), allowNull: false },
  marca: DataTypes.STRING(100),
  codigoBarras: DataTypes.STRING(14),
  imagemUrl: DataTypes.STRING(500),
  calorias100g: DataTypes.FLOAT,
  proteinas100g: DataTypes.FLOAT,
  carboidratos100g: DataTypes.FLOAT,
  gorduras100g: DataTypes.FLOAT,
}, { tableName: 'alimentos' })
export const AlimentoSalvo = sequelize.define('AlimentoSalvo', {
  chave: { type: DataTypes.STRING(60), allowNull: false },
  nome: { type: DataTypes.STRING(140), allowNull: false },
  marca: DataTypes.STRING(100),
  imagemUrl: DataTypes.STRING(500),
  fonte: DataTypes.STRING(40),
}, { tableName: 'alimentos_salvos', indexes: [{ unique: true, fields: ['usuario_id', 'chave'] }] })
export const Receita = sequelize.define('Receita', {
  nome: { type: DataTypes.STRING(140), allowNull: false },
  tempoMin: DataTypes.INTEGER,
  porcoes: DataTypes.INTEGER,
  resumo: DataTypes.STRING(450),
  dificuldade: DataTypes.STRING(20),
  ingredientes: { type: DataTypes.TEXT, allowNull: false }, // JSON array of lines
  preparo: { type: DataTypes.TEXT, allowNull: false },
  imagemUrl: DataTypes.STRING(500),
  videoUrl: DataTypes.STRING(500),
  fotoCredito: DataTypes.TEXT,
  receitaOriginalId: DataTypes.INTEGER,
}, { tableName: 'receitas' })
export const ReceitaSalva = sequelize.define('ReceitaSalva', {
  chave: { type: DataTypes.STRING(50), allowNull: false }, // local:ID or externa:ID
  nome: { type: DataTypes.STRING(140), allowNull: false },
  imagemUrl: DataTypes.STRING(500),
  fonte: DataTypes.STRING(40),
}, { tableName: 'receitas_salvas', indexes: [{ unique: true, fields: ['usuario_id', 'chave'] }] })
Usuario.hasMany(Alimento, { as: 'alimentosCriados', foreignKey: { name: 'autorId', allowNull: false } })
Alimento.belongsTo(Usuario, { as: 'autor', foreignKey: 'autorId' })
Usuario.hasMany(AlimentoSalvo, { foreignKey: { name: 'usuarioId', allowNull: false } })
AlimentoSalvo.belongsTo(Usuario, { foreignKey: 'usuarioId' })
Usuario.hasMany(Receita, { as: 'receitas', foreignKey: { name: 'autorId', allowNull: false } })
Receita.belongsTo(Usuario, { as: 'autor', foreignKey: 'autorId' })
Usuario.hasMany(ReceitaSalva, { foreignKey: { name: 'usuarioId', allowNull: false } })
ReceitaSalva.belongsTo(Usuario, { foreignKey: 'usuarioId' })
// Vínculo opcional: manter uma publicação do feed consistente com a receita cadastrada.
Receita.hasOne(Publicacao, { foreignKey: 'receitaId', as: 'publicacao' })
Publicacao.belongsTo(Receita, { foreignKey: 'receitaId', as: 'receita' })

Receita.belongsTo(Receita, { as: 'original', foreignKey: 'receitaOriginalId', constraints: false })
Receita.hasMany(Receita, { as: 'versoes', foreignKey: 'receitaOriginalId', constraints: false })

// Chat privado e fila de moderação; conteúdo de denúncias mantém snapshot mesmo após remoção.
export const Mensagem = sequelize.define('Mensagem', {
  texto: { type: DataTypes.TEXT, allowNull: false },
  tipo: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'texto' },
  receitaId: DataTypes.INTEGER,
  tituloReceita: DataTypes.STRING(140),
  lidaEm: DataTypes.DATE,
}, { tableName: 'mensagens' })
Mensagem.belongsTo(Usuario, { as: 'remetente', foreignKey: { name: 'remetenteId', allowNull: false } })
Mensagem.belongsTo(Usuario, { as: 'destinatario', foreignKey: { name: 'destinatarioId', allowNull: false } })
export const Denuncia = sequelize.define('Denuncia', {
  tipoAlvo: { type: DataTypes.STRING(15), allowNull: false },
  alvoId: { type: DataTypes.INTEGER, allowNull: false },
  tituloSnapshot: { type: DataTypes.STRING(140), allowNull: false },
  motivo: { type: DataTypes.STRING(35), allowNull: false },
  detalhes: DataTypes.STRING(1200),
  status: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'pendente' },
  observacaoAdmin: DataTypes.STRING(1200),
  moderadorId: DataTypes.INTEGER,
  analisadaEm: DataTypes.DATE,
}, { tableName: 'denuncias' })
Denuncia.belongsTo(Usuario, { as: 'denunciante', foreignKey: { name: 'denuncianteId', allowNull: false } })
Denuncia.belongsTo(Usuario, { as: 'autorAlvo', foreignKey: { name: 'autorAlvoId', allowNull: false } })
