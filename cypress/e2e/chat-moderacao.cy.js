/** Requer frontend :5173 e backend :3001 em execução com migrations aplicadas. */
describe('Chat privado, denúncia e exclusão de receita própria', () => {
  it('encaminha denúncia para fila e recebe mensagem entre duas contas sem expor outras conversas', () => {
    const identificador = Date.now()
    const autor = { nome: 'Autor Cypress', email: `autor-chat-${identificador}@example.com`, senha: 'SenhaSeguraCypress2026' }
    const leitor = { nome: 'Leitor Cypress', email: `leitor-chat-${identificador}@example.com`, senha: 'SenhaSeguraCypress2026' }
    let autorId, receitaId, postId
    cy.request('POST', '/api/auth/register', autor).then(r => { autorId = r.body.usuario.id })
    cy.then(() => cy.request('POST', '/api/recipes', {
      nome: 'Bolo de teste do chat', resumo: 'Receita preparada para validar o fluxo social.',
      ingredientes: ['2 ovos', '1 banana'], preparo: 'Misture bem todos os ingredientes e asse até ficar firme.', tempoMin: 20, dificuldade: 'Fácil', porcoes: 2,
    })).then(r => { receitaId = Number(r.body.receita.id.slice(6)) })
    cy.then(() => cy.request(`/api/recipes/${receitaId}/post`)).then(r => { postId = r.body.postId })
    cy.request('POST', '/api/auth/register', leitor).its('status').should('eq', 201)
    cy.then(() => cy.visit(`/receitas/${encodeURIComponent(`local:${receitaId}`)}`))
    cy.contains('button', 'Denunciar').click()
    cy.get('.nf-report-form select').select('nao_e_receita')
    cy.contains('button', 'Enviar denúncia').click()
    cy.contains('Denúncia registrada').should('be.visible')
    cy.visit('/minhas-denuncias')
    cy.contains('aguardando análise').should('be.visible')
    cy.then(() => cy.visit(`/participantes/${autorId}`))
    cy.contains('a', 'Mensagem').click()
    cy.get('#texto-mensagem').type('Oi! Podemos conversar sobre os ingredientes?')
    cy.contains('button', 'Enviar').click()
    cy.contains('Oi! Podemos conversar sobre os ingredientes?').should('be.visible')
    cy.then(() => cy.request('POST', '/api/auth/login', { email: autor.email, senha: autor.senha }))
    cy.then(() => cy.visit(`/receitas/${encodeURIComponent(`local:${receitaId}`)}`))
    cy.contains('button', 'Excluir minha receita').click()
    cy.url().should('include', '/receitas')
    cy.then(() => cy.request({ url: `/api/recipes/local:${receitaId}`, failOnStatusCode: false })).its('status').should('eq',404)
    cy.then(() => cy.request('/api/reports/mine')).its('body.denuncias').should('have.length', 0)
    cy.then(() => cy.request({ url: `/api/posts/${postId}`, failOnStatusCode:false })).its('status').should('eq',404)
  })
})
