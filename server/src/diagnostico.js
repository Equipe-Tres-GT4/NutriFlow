/** Diagnóstico SOMENTE LEITURA: não cria contas, não altera senhas nem executa migrations. */
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcrypt'
import { sequelize, Usuario } from './models.js'

const log = (status, msg) => console.log(`${status} ${msg}`)
const port = Number(process.env.PORT || 3001)
const storage = sequelize.options.storage
const dbPath = storage === ':memory:' ? storage : path.resolve(storage)
const adminFile = path.resolve(process.env.ADMIN_SEED_FILE || '.admin-seed.local.json')

log('INFO', `Diretório de execução: ${process.cwd()}`)
log('INFO', `Banco configurado: ${dbPath}`)
log('INFO', `Arquivo local das contas admin: ${adminFile}`)
log('INFO', `Backend esperado em: http://127.0.0.1:${port}/api/health`)

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  log('ERRO', 'JWT_SECRET inválido ou ausente em server/.env (mínimo 32 caracteres).')
} else {
  log('OK', 'JWT_SECRET configurado (valor não exibido).')
}

try {
  const resposta = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(2000) })
  log(resposta.ok ? 'OK' : 'ERRO', `Backend HTTP: ${resposta.status}`)
} catch {
  log('ATENÇÃO', 'Backend HTTP não responde. É normal se npm run dev ainda não estiver aberto em outro terminal.')
}

try {
  await sequelize.authenticate()
  log('OK', 'SQLite abriu com sucesso.')
  const [tabelas] = await sequelize.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('usuarios','_nutriflow_migrations') ORDER BY name")
  const nomes = new Set(tabelas.map(t => t.name))
  if (!nomes.has('usuarios')) {
    log('ERRO', 'Tabela usuarios não encontrada. Execute npm run db:migrate após backup.')
  } else {
    const [versao] = nomes.has('_nutriflow_migrations')
      ? await sequelize.query('SELECT name FROM "_nutriflow_migrations" ORDER BY name') : [[]]
    log('INFO', `${versao.length} migrations registradas no banco: ${versao.map(v => v.name).join(', ') || '(nenhuma)'}`)
    const comuns = await Usuario.count({ where: { papel: 'usuario', isDemo: false } })
    const demo = await Usuario.count({ where: { isDemo: true } })
    const admins = await Usuario.count({ where: { papel: 'admin' } })
    log('INFO', `${comuns} usuários reais, ${demo} perfis DEMO, ${admins} administradores.`)
    if (demo > 0) log('INFO', 'Perfis DEMO possuem senha aleatória e não permitem login.')

    try {
      const contas = JSON.parse(await readFile(adminFile, 'utf8'))
      if (!Array.isArray(contas) || contas.length !== 5) throw new Error('O arquivo não contém exatamente cinco contas.')
      for (const c of contas) {
        const email = typeof c.email === 'string' ? c.email.trim().toLowerCase() : ''
        const conta = email ? await Usuario.findOne({ where: { email } }) : null
        if (!conta) { log('FALTA', `${email || '(email ausente)'}: NÃO EXISTE no banco. Execute npm run db:seed:admins.`); continue }
        if (conta.papel !== 'admin') { log('ERRO', `${email}: conta existe, mas NÃO é administradora.`); continue }
        if (typeof c.senha !== 'string') { log('ERRO', `${email}: senha ausente no arquivo local.`); continue }
        const confere = await bcrypt.compare(c.senha, conta.senhaHash)
        log(confere ? 'OK' : 'DIVERGENTE', `${email}: ${confere ? 'conta existe e senha do arquivo confere' : 'conta existe, mas senha NÃO corresponde ao arquivo (seed preserva senha antiga)'}.`)
      }
    } catch (e) {
      if (e.code === 'ENOENT') log('FALTA', 'Arquivo .admin-seed.local.json não encontrado na pasta server. Não é incluído no ZIP principal.')
      else log('ERRO', `Não foi possível conferir as contas: ${e.message}`)
    }
  }
} catch (e) {
  log('ERRO', `Falha ao consultar o banco: ${e.message}`)
  log('DICA', 'Confira a pasta server, o arquivo .env, e o DB_STORAGE. NÃO exclua o banco.')
} finally {
  await sequelize.close()
}
