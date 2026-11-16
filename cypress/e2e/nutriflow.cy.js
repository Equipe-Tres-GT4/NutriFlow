describe('NutriFlow — navegação e jornadas reais', () => {
  it('abre a Comunidade como entrada principal sem Início ou Alimentos no menu', () => {
    cy.viewport(1280, 800)
    cy.visit('/')
    cy.url().should('include', '/comunidade')
    cy.get('nav[aria-label="Navegação principal"]').should('contain', 'Comunidade').and('contain', 'Receitas')
      .and('not.contain', 'Início').and('not.contain', 'Alimentos')
      .and('not.contain', 'APIs externas').and('not.contain', 'Aulas')
  })
  it('redireciona links antigos de alimentos para Receitas', () => {
    cy.visit('/alimentos')
    cy.url().should('include', '/receitas')
  })
  it('mantém a navegação acessível no celular', () => {
    cy.viewport(375, 812)
    cy.visit('/')
    cy.get('button[aria-label="Abrir navegação"]').click()
    cy.get('nav[aria-label="Navegação principal"]').should('be.visible').within(() => {
      cy.contains('Receitas').click()
    })
    cy.url().should('include', '/receitas')
  })
  it('exibe estados no cadastro mesmo quando o backend usa a lista local de UFs', () => {
    cy.intercept('GET', '**/api/integrations/location/states', {
      statusCode: 200, body: { estados: [{id:23,sigla:'CE',nome:'Ceará'}, {id:35,sigla:'SP',nome:'São Paulo'}], modoReserva:true },
    }).as('uf')
    cy.intercept('GET', '**/api/integrations/location/states/CE/cities', {
      statusCode: 200, body: { cidades: [], modoManual:true },
    })
    cy.visit('/cadastro')
    cy.wait('@uf')
    cy.get('#cd-uf').should('contain', 'Ceará').select('CE')
    cy.get('#cd-cidade').type('Fortaleza')
    cy.contains('pode informar sua cidade manualmente').should('be.visible')
  })
  it('consulta alimentos pela API dentro do cadastro de receitas', () => {
    cy.intercept('GET','**/api/auth/me', { statusCode:200, body:{usuario:{id:999,nome:'Pessoa de teste',email:'teste@example.com'}} }).as('sessao')
    cy.intercept('GET','**/api/foods?q=aveia', { statusCode:200, body:{alimentos:[{chave:'off:3017620422003',nome:'Aveia integral',marca:'Marca teste',fonte:'Open Food Facts'}],fonteExterna:true} }).as('foods')
    cy.visit('/receitas/cadastrar')
    cy.get('#rc-busca').type('aveia')
    cy.contains('button','Buscar').click()
    cy.wait('@foods')
    cy.contains('Aveia integral').should('be.visible')
  })
  it('permite cadastrar e publicar receita para os demais usuários', () => {
    // Diagnóstico do fluxo real: confirma a validade HTML e o retorno da API,
    // antes de exigir o redirecionamento. Não intercepta nem simula a resposta.
    cy.intercept('POST', '**/api/auth/register').as('registroReal')
    cy.visit('/cadastro')
    cy.get('input[name="nome"]').type('Aluno GT4')
    cy.get('input[name="email"]').type(`aluno-${Date.now()}-${Cypress._.random(1000, 9999)}@example.com`)
    cy.get('input[name="senha"]').type('SenhaSegura2026')
    cy.get('input[name="confirmarSenha"]').type('SenhaSegura2026')
    cy.get('form').should($form => {
      expect($form[0].checkValidity(), 'validade HTML do cadastro').to.equal(true)
    })
    cy.contains('button','Criar conta e participar').click()
    cy.wait('@registroReal', { timeout: 20000 }).then(({ response }) => {
      expect(response, 'resposta HTTP do cadastro').to.exist
      expect(
        response.statusCode,
        `POST /api/auth/register retornou: ${JSON.stringify(response.body)}`,
      ).to.equal(201)
      expect(response.body?.usuario?.id, 'ID do novo usuário').to.exist
    })
    cy.url().should('include', '/comunidade')
    cy.visit('/receitas/cadastrar')
    cy.get('#rc-nome').type('Salada do Cypress')
    cy.get('#rc-ingredientes').type('1 tomate\n1 pepino')
    cy.get('#rc-preparo').type('Lave os legumes, pique em cubos e misture.')
    cy.contains('button','Publicar receita').click()
    cy.contains('Salada do Cypress').should('be.visible')
  })
})
