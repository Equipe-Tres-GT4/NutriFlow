/** Contas administrativas são provisionadas SOMENTE via arquivo local fora do Git.
 * Repetir o comando não altera a senha de contas existentes.
 * Erros de colisão com e-mails normais não promovem usuários.
 */
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcrypt'
import { Usuario, sequelize } from './models.js'
import { executarMigracoes } from './migrations.js'

const arquivo = process.env.ADMIN_SEED_FILE || path.resolve('.admin-seed.local.json')
try {
  if (process.env.NODE_ENV === 'production') throw new Error('Provisionamento por arquivo desabilitado em produção.')
  const contas = JSON.parse(await readFile(arquivo, 'utf8'))
  if (!Array.isArray(contas) || contas.length !== 5) throw new Error('O arquivo deve conter exatamente cinco administradores.')
  const emails = new Set()
  for (const conta of contas) {
    if (typeof conta.nome !== 'string' || conta.nome.length < 3 || typeof conta.email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(conta.email) || typeof conta.senha !== 'string' || conta.senha.length < 16) throw new Error('Nome, email ou senha inválidos em conta administrativa.')
    if (emails.has(conta.email.toLowerCase())) throw new Error('E-mails administrativos duplicados.')
    emails.add(conta.email.toLowerCase())
  }
  await executarMigracoes(sequelize)
  for (const c of contas) {
    const email = c.email.trim().toLowerCase()
    const existente = await Usuario.findOne({ where: { email } })
    if (existente && existente.papel !== 'admin') throw new Error(`Já existe conta comum com ${email}; interrompido sem alterar permissões.`)
    if (existente) { console.log(`EXISTENTE ${email} (senha preservada)`); continue }
    await Usuario.create({ nome: c.nome.trim(), email, senhaHash: await bcrypt.hash(c.senha, 12), papel: 'admin', objetivo: 'Equipe NutriFlow' })
    console.log(`CRIADO ${email}`)
  }
  console.log('Administradores criados. Guarde as senhas localmente e não publique o arquivo de provisionamento.')
} catch (error) { console.error(error.message); process.exitCode = 1 }
finally { await sequelize.close() }
