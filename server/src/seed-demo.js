/** Conteúdo de demonstração explícito e idempotente.
 * Executar SOMENTE quando desejado: npm run db:seed:demo
 * Nunca apaga usuários, publicações ou receitas já cadastradas.
 * Os e-mails .invalid não recebem mensagens e as senhas são aleatórias/irrecuperáveis.
 */
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import bcrypt from 'bcrypt'
import { sequelize, Usuario, Receita, Publicacao, Curtida, ReceitaSalva, Comentario, Seguidor } from './models.js'
import { executarMigracoes } from './migrations.js'
import { perfisDemo } from './demo-content.js'

const avataresDemo = ['/demo/avatars/marina.webp', '/demo/avatars/carlos.webp', '/demo/avatars/aline.webp', '/demo/avatars/joana.webp', '/demo/avatars/bruno.webp']

const modelos = [
  'Adorei a combinação! Vou testar na próxima semana.',
  'Boa dica para variar o cardápio com ingredientes comuns.',
  'Essa receita parece ótima para organizar as refeições.',
  'Gostei do passo a passo. Obrigado por compartilhar!',
  'Já salvei para preparar em outro dia.',
]

export async function popularDemo() {
  // Verifica migration 004 antes de escrever para preservar banco existente.
  await executarMigracoes(sequelize)
  const autores = []
  let criados = 0, publicacoes = 0, salvos = 0, curtidas = 0, comentarios = 0

  for (const [indicePerfil, perfil] of perfisDemo.entries()) {
    const hashInacessivel = await bcrypt.hash(randomBytes(32).toString('hex'), 10)
    const [usuario, criado] = await Usuario.findOrCreate({
      where: { email: perfil.email },
      defaults: { nome: perfil.nome, email: perfil.email, objetivo: perfil.objetivo, senhaHash: hashInacessivel, isDemo: true, fotoUrl: avataresDemo[indicePerfil] },
    })
    if (!usuario.isDemo) throw new Error(`O e-mail reservado ${perfil.email} já existe em conta real; abortando seed.`)
    if (criado) criados += 1
    if (usuario.fotoUrl !== avataresDemo[indicePerfil]) await usuario.update({ fotoUrl: avataresDemo[indicePerfil] })
    autores.push(usuario)
  }
  // Rede de demonstração com vínculos unidirecionais e amizades mútuas.
  // Não altera relacionamentos de contas reais.
  const ligacoes = [[0,1],[1,0],[0,2],[2,3],[3,2],[4,0],[1,4],[4,1],[3,1],[2,4]]
  let novosSeguimentos = 0
  for (const [de, para] of ligacoes) {
    const [, novo] = await Seguidor.findOrCreate({ where: { seguidorId: autores[de].id, seguidoId: autores[para].id } })
    if (novo) novosSeguimentos++
  }
  const posts = []
  const hoje = Date.now()
  // Intercala receitas dos cinco autores para o feed inicial ficar variado.
  for (let indice = 0; indice < 5; indice++) {
    for (let autorIndex = 0; autorIndex < perfisDemo.length; autorIndex++) {
      const perfil = perfisDemo[autorIndex]
      const autor = autores[autorIndex]
      const item = perfil.receitas[indice]
      const momento = new Date(hoje - (5 * indice + autorIndex + 1) * 3 * 60 * 60 * 1000)
      const [receita] = await Receita.findOrCreate({
        where: { nome: item.nome, autorId: autor.id },
        defaults: {
          nome: item.nome, autorId: autor.id, ingredientes: JSON.stringify(item.ingredientes),
          preparo: item.preparo, resumo: item.resumo, porcoes: 2 + (indice % 3), dificuldade: item.dificuldade, tempoMin: item.tempoMin,
          imagemUrl: item.imagemUrl, createdAt: momento, updatedAt: momento,
        },
      })
      if (!receita.resumo || !receita.porcoes) await receita.update({ resumo: item.resumo, porcoes: receita.porcoes || 2 + (indice % 3) })
      const conteudo = `${item.resumo}\n\nIngredientes:\n${item.ingredientes.join('\n')}\n\nModo de preparo:\n${item.preparo}\n\nReceita: /receitas/local:${receita.id}`
      const [post, postCriado] = await Publicacao.findOrCreate({
        where: { receitaId: receita.id },
        defaults: { titulo: item.nome, conteudo, tipo: 'receita', imagemUrl: item.imagemUrl, receitaId: receita.id, autorId: autor.id, createdAt: momento, updatedAt: momento },
      })
      if (postCriado) publicacoes += 1
      posts.push({ post, receita, autorIndex, indice })
    }
  }

  for (const { post, receita, autorIndex, indice } of posts) {
    // Distribuição desigual e determinística para demonstrar filtros por popularidade.
    const quantidadeFavoritos = 1 + ((indice * 7 + autorIndex * 3) % 5)
    const quantidadeCurtidas = 1 + ((indice * 3 + autorIndex * 2) % 5)
    for (let i = 0; i < quantidadeFavoritos; i++) {
      const leitor = autores[(autorIndex + i + 1) % autores.length]
      const [, novo] = await ReceitaSalva.findOrCreate({
        where: { usuarioId: leitor.id, chave: `local:${receita.id}` },
        defaults: { nome: receita.nome, imagemUrl: receita.imagemUrl, fonte: 'Comunidade' },
      })
      if (novo) salvos += 1
    }
    for (let i = 0; i < quantidadeCurtidas; i++) {
      const leitor = autores[(autorIndex + i + 1) % autores.length]
      const [, novo] = await Curtida.findOrCreate({ where: { usuarioId: leitor.id, publicacaoId: post.id } })
      if (novo) curtidas += 1
    }
    // Comentários visivelmente vinculados a perfis de demonstração.
    for (let i = 0; i < (indice % 3 === 0 ? 2 : 1); i++) {
      const leitor = autores[(autorIndex + i + 2) % autores.length]
      const texto = modelos[(indice + autorIndex + i) % modelos.length]
      const [, novo] = await Comentario.findOrCreate({ where: { autorId: leitor.id, publicacaoId: post.id, texto } })
      if (novo) comentarios += 1
    }
  }
  return {
    perfisDemo: await Usuario.count({ where: { isDemo: true } }),
    receitasDemo: await Receita.count({ where: { autorId: autores.map(a => a.id) } }),
    novosUsuarios: criados, novasPublicacoes: publicacoes,
    novosFavoritos: salvos, novasCurtidas: curtidas, novosComentarios: comentarios, novosSeguimentos,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    await sequelize.authenticate()
    const resumo = await popularDemo()
    console.log('NutriFlow — demonstração carregada:', resumo)
    console.log('Perfis são fictícios (selo DEMO). Contas reais permanecem intactas; repetir não duplica registros.')
  } catch (error) { console.error('Falha ao popular demonstração:', error.message); process.exitCode = 1 }
  finally { await sequelize.close() }
}
