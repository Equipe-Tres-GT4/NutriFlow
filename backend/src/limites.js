/**
 * Protege autenticação em uso normal: 30 solicitações / 15 minutos.
 * Cypress recebe 150 apenas quando API usa ambiente de testes e banco
 * temporário de nome controlado pelo lançador E2E isolado.
 */
function ehE2EIsolado(env = process.env) {
  const arquivoBanco = String(env.DB_STORAGE || '')
  return env.NODE_ENV === 'test'
    && env.NUTRIFLOW_E2E_ISOLADO === '1'
    && /(?:^|[/\\])nutriflow-e2e-[^/\\]+[/\\]nutriflow-cypress\.sqlite$/i.test(arquivoBanco)
}

/** Protecao geral: 120/min no site real. O E2E isolado recebe 600/min
 * para que as jornadas automatizadas nao consumam a cota compartilhada.
 */
export function limiteGeral(env = process.env) {
  return ehE2EIsolado(env) ? 600 : 120
}

/** Autenticacao permanece restrita em producao/desenvolvimento. */
export function limiteAutenticacao(env = process.env) {
  return ehE2EIsolado(env) ? 150 : 30
}

/** Consultas de sessão e logout têm o limitador geral (120/minuto),
 * deixando o limitador mais rígido apenas para tentativas de login/cadastro.
 */
export function ignorarLimiteAutenticacao(req) {
  return ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    || (req.method === 'POST' && req.path === '/logout')
}
