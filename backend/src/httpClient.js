/**
 * Cliente HTTP centralizado e encapsulado em classe (conceito de POO).
 * Em execução normal usa Axios, conforme a aula gt4-tarde/axios.
 * No teste offline, NF_HTTP_DRIVER=fetch permite simular serviços sem npm/rede.
 * O backend usa URLs definidas nos adaptadores; nunca recebe URL arbitrária de usuários.
 */
export class ClienteHttp {
  constructor({ timeout = 7000, driver = null } = {}) {
    this.timeout = timeout
    this.driver = driver
  }

  async getJson(url, { timeout = this.timeout, headers = {} } = {}) {
    const driver = this.driver || process.env.NF_HTTP_DRIVER || 'axios'
    if (driver === 'fetch') {
      const resposta = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
        headers: { Accept: 'application/json', ...headers },
      })
      return { status: resposta.status, data: await resposta.json() }
    }
    if (driver !== 'axios') throw new Error('Driver HTTP inválido.')
    const { default: axios } = await import('axios')
    const resposta = await axios.get(String(url), {
      timeout,
      headers: { Accept: 'application/json', ...headers },
      responseType: 'json',
      validateStatus: () => true,
      maxRedirects: 3,
    })
    return { status: resposta.status, data: resposta.data }
  }
}

const cliente = new ClienteHttp()
export const getJson = (url, opcoes) => cliente.getJson(url, opcoes)
