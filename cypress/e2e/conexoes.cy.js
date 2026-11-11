// Requer backend e frontend rodando. O seed DEMO oferece perfis com receitas.
describe('Conexões e feed pessoal', () => {
  it('exige autenticação para visualizar conexões', () => {
    cy.clearCookies()
    cy.visit('/conexoes')
    cy.url().should('include', '/login')
  })
  it('permite seguir pessoa e consultar o feed personalizado', () => {
    const email = `cypress-social-${Date.now()}@example.com`
    cy.request('POST', '/api/auth/register', { nome: 'Teste Cypress', email, senha: 'seguroTeste123' }).its('status').should('eq', 201)
    cy.visit('/conexoes?aba=descobrir')
    cy.contains('Suas conexões').should('be.visible')
    cy.get('.nf-person-card').should('have.length.greaterThan', 0)
    cy.get('.nf-person-card').first().find('button.nf-person-follow').click()
    cy.get('.nf-person-card').first().find('button.nf-person-follow').should('contain', 'Seguindo')
    cy.visit('/comunidade?feed=seguindo')
    cy.get('.nf-feed-mode-tabs button.active').should('contain', 'Seguindo')
    cy.visit('/conexoes?aba=seguindo')
    cy.get('.nf-person-card').should('have.length.at.least', 1)
  })
})
