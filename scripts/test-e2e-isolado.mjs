/**
 * Executa Cypress com API, frontend e SQLite temporários, sem acessar o banco principal.
 * Proteção de autenticação continua ligada: cada execução usa um novo processo de API.
 * Requer dependências do projeto previamente instaladas, inclusive Cypress.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = join(raiz, 'server')
const pastaTeste = mkdtempSync(join(tmpdir(), 'nutriflow-e2e-'))
const apiPort = 3002
const vitePort = 5174
const apiUrl = `http://127.0.0.1:${apiPort}`
const frontUrl = `http://127.0.0.1:${vitePort}`
const envApi = {
  ...process.env,
  NODE_ENV: 'test',
  NUTRIFLOW_E2E_ISOLADO: '1',
  PORT: String(apiPort),
  DB_STORAGE: join(pastaTeste, 'nutriflow-cypress.sqlite'),
  MEDIA_STORAGE: join(pastaTeste, 'uploads'),
  // Cypress navega em 127.0.0.1:5174. Liberar APENAS esta origem e sua
  // variante localhost no ambiente de teste isolado. O backend normal
  // continua respeitando o CORS_ORIGIN definido em server/.env.
  CORS_ORIGIN: `http://127.0.0.1:${vitePort},http://localhost:${vitePort}`,
}
const envFrontend = { ...process.env, NUTRIFLOW_API_TARGET: apiUrl }
const filhos = []
let interrompido = false

function iniciar(script, argumentos, opcoes = {}) {
  if (!existsSync(script)) throw new Error(`Arquivo não encontrado: ${script}. Execute npm install na raiz do projeto e no server.`)
  const processo = spawn(process.execPath, [script, ...argumentos], {
    cwd: opcoes.cwd || raiz,
    env: opcoes.env || process.env,
    stdio: 'inherit',
    windowsHide: true,
  })
  filhos.push(processo)
  return processo
}

async function aguardarHttp(url, processo, nome, limiteMs = 60000) {
  const final = Date.now() + limiteMs
  while (Date.now() < final) {
    if (interrompido) throw new Error('Execução interrompida pelo usuário.')
    if (processo.exitCode !== null || processo.signalCode !== null) {
      throw new Error(`${nome} foi encerrado antes de ficar pronto (código ${processo.exitCode}). Verifique se a porta está livre.`)
    }
    try {
      const resposta = await fetch(url, { signal: AbortSignal.timeout(1500) })
      if (resposta.ok) return
    } catch { /* o processo ainda está inicializando */ }
    await new Promise(r => setTimeout(r, 350))
  }
  throw new Error(`${nome} não ficou disponível em ${url}. Verifique as portas ${apiPort} e ${vitePort}.`)
}

async function esperarSaida(processo, nome) {
  return new Promise((resolver, rejeitar) => {
    processo.once('error', rejeitar)
    processo.once('close', codigo => {
      if (codigo === 0) resolver()
      else rejeitar(new Error(`${nome} terminou com código ${codigo}.`))
    })
  })
}

async function encerrarTudo() {
  for (const filho of filhos) {
    if (filho.exitCode === null && filho.signalCode === null) {
      try { filho.kill() } catch { /* já foi encerrado */ }
    }
  }
  await Promise.all(filhos.map(filho => new Promise(resolver => {
    if (filho.exitCode !== null || filho.signalCode !== null) return resolver()
    const timeout = setTimeout(resolver, 2500)
    filho.once('close', () => { clearTimeout(timeout); resolver() })
  })))
  try { rmSync(pastaTeste, { recursive: true, force: true, maxRetries: 5, retryDelay: 350 }) }
  catch (erro) { console.warn(`Banco temporário pode ser apagado depois: ${pastaTeste} (${erro.message})`) }
}

process.on('SIGINT', () => { interrompido = true })
process.on('SIGTERM', () => { interrompido = true })

try {
  console.log('\nNutriFlow E2E ISOLADO — porta 3002 (API), porta 5174 (frontend).')
  console.log('O banco server/data/nutriflow.sqlite NÃO será utilizado nem alterado.')
  console.log('Limites E2E: geral 600/min, autenticação 150/15 min. Site normal: geral 120/min, autenticação 30/15 min.\n')
  const api = iniciar(join(serverDir, 'src', 'index.js'), [], { cwd: serverDir, env: envApi })
  await aguardarHttp(`${apiUrl}/api/health`, api, 'Backend')
  // Confere o limite realmente servido pelo Express antes de executar Cypress.
  // Evita execucoes com arquivo antigo e diagnosticos inconclusivos de HTTP 429.
  const respostaSaude = await fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(5000) })
  const cabecalhoPolitica = respostaSaude.headers.get('ratelimit-policy') || ''
  if (!/(?:^|[,\s])600;w=60(?:$|[,\s])/.test(cabecalhoPolitica)) {
    throw new Error(`API de teste nao aplicou o limite geral de 600/min (cabecalho: ${cabecalhoPolitica || 'ausente'}). Confira os arquivos server/src/app.js e server/src/limites.js.`)
  }
  console.log(`Limitador geral do teste confirmado: ${cabecalhoPolitica}.`)
  const respostaLogin = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { Origin: frontUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prova-limite-inexistente@example.invalid', senha: 'senha-invalida' }),
    signal: AbortSignal.timeout(5000),
  })
  const politicaLogin = respostaLogin.headers.get('ratelimit-policy') || ''
  if (respostaLogin.status !== 401 || !/(?:^|[,\s])150;w=900(?:$|[,\s])/.test(politicaLogin)) {
    throw new Error(`Limite de autenticacao E2E inesperado: HTTP ${respostaLogin.status}; politica ${politicaLogin || 'ausente'}. Confira server/src/limites.js e server/src/app.js.`)
  }
  console.log(`Limitador de autenticacao do teste confirmado: ${politicaLogin}.`)
  // Verifica também rotas POST antes de rodar a suíte: o health (GET) passa
  // mesmo quando o middleware de proteção rejeita a origem (HTTP 403).
  const verificacaoOrigem = await fetch(`${apiUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: frontUrl },
    signal: AbortSignal.timeout(5000),
  })
  if (verificacaoOrigem.status === 403) {
    throw new Error(`API isolada rejeitou a origem ${frontUrl} (HTTP 403). Verifique CORS_ORIGIN.`)
  }
  if (verificacaoOrigem.status !== 200) {
    throw new Error(`Verificação POST de origem retornou HTTP ${verificacaoOrigem.status} (esperado 200).`)
  }
  console.log(`Origem de teste autorizada: ${frontUrl} (POST HTTP 200).`)
  console.log('\nPreparando cinco perfis e 25 receitas no SQLite temporário...')
  const seed = iniciar(join(serverDir, 'src', 'seed-demo.js'), [], { cwd: serverDir, env: envApi })
  await esperarSaida(seed, 'Seed de demonstração')
  const vite = iniciar(join(raiz, 'node_modules', 'vite', 'bin', 'vite.js'), ['--host', '127.0.0.1', '--port', String(vitePort), '--strictPort'], { env: envFrontend })
  await aguardarHttp(frontUrl, vite, 'Frontend')
  console.log('\nExecutando Cypress com ambiente limpo, sem desativar limites de segurança...\n')
  const cypress = iniciar(join(raiz, 'node_modules', 'cypress', 'bin', 'cypress'), [
    'run', '--config', `baseUrl=${frontUrl}`,
  ])
  await esperarSaida(cypress, 'Cypress')
  console.log('\nSUCESSO: todos os testes E2E passaram no ambiente isolado.')
} catch (erro) {
  console.error(`\nERRO NOS TESTES E2E: ${erro.message}`)
  process.exitCode = 1
} finally {
  await encerrarTudo()
  console.log('Ambiente de teste encerrado; banco principal preservado.')
}
