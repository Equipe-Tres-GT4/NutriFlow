// Requer `npm run demo:prepare` na raiz e ambos servidores ativos.
describe('Feed visual de receitas do NutriFlow', () => {
  it('mostra receitas destacadas, sem mosaico de usuários', () => {
    cy.visit('/comunidade')
    cy.contains('Receitas que inspiram.').should('be.visible')
    cy.get('.nf-instapost').should('have.length.greaterThan', 0)
    cy.get('.nf-instapost').first().within(() => {
      cy.get('.nf-instamedia').should('be.visible')
      cy.get('.nf-post-title').should('be.visible')
      cy.contains('Ingredientes e preparo').should('be.visible')
      cy.contains('Criar minha versão').should('be.visible')
    })
    cy.get('.nf-creators-scroll').should('not.exist')
  })
  it('abre o detalhe da receita e o histórico de versões', () => {
    cy.visit('/comunidade')
    cy.get('.nf-instapost .nf-post-title a').first().click()
    cy.url().should('include', '/receitas/local')
    cy.contains('Ingredientes').should('be.visible')
    cy.contains('Modo de preparo').should('be.visible')
    cy.contains('Criar minha versão').should('be.visible')
  })
})
