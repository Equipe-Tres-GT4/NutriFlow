/** Inventário de aulas e correspondência com o projeto.
 * 'Indisponível' significa que a URL informada não expôs código publicamente na consulta.
 * Não afirma que um repositório privado esteja implementado integralmente.
 */
const base = 'https://github.com/gt4-tarde/'
export const aulas = [
  { id: 'sequelize-api', url: base+'sequelize-api', publico: false, estado: 'sem_acesso', tema: 'API ORM Sequelize', aplicacao: 'Backend já utiliza modelos, associações e CRUD com Sequelize; código da aula pendente de comparação.', arquivos: ['server/src/models.js', 'server/src/app.js'] },
  { id: 'sequelize-app', url: base+'sequelize-app', publico: false, estado: 'sem_acesso', tema: 'Aplicação Sequelize', aplicacao: 'Migrations e modelos documentados, sem alegar reutilização de código inacessível.', arquivos: ['server/src/migrations.js', 'server/migrations/'] },
  { id: 'express-api', url: base+'express-api', publico: false, estado: 'sem_acesso', tema: 'Express/API', aplicacao: 'Rotas e middlewares Express já aplicados; comparação exata pendente.', arquivos: ['server/src/app.js', 'server/src/middlewares.js'] },
  { id: 'poo-js', url: base+'poo-js', publico: false, estado: 'sem_acesso', tema: 'Programação orientada a objetos', aplicacao: 'Cliente externo encapsulado em classe; comparação exata pendente.', arquivos: ['server/src/httpClient.js'] },
  { id: 'gt-store', url: base+'gt-store', publico: true, estado: 'conceito_aproveitado', tema: 'React, Bootstrap e componentes de produtos', aplicacao: 'Mantido catálogo alimentar em React, com componentes e Bootstrap. Não foi copiado código de loja.', arquivos: ['src/components/Catalogo.jsx', 'src/pages/Integracoes.jsx'] },
  { id: 'NodeJs', url: base+'NodeJs', publico: false, estado: 'sem_acesso', tema: 'Node.js', aplicacao: 'Servidor Node.js em uso; sem comparação com o material restrito.', arquivos: ['server/src/index.js'] },
  { id: 'gtres', url: base+'gtres', publico: true, estado: 'conceito_aproveitado', tema: 'React, Vite e React Router', aplicacao: 'Rotas, componentes e navegação React já existentes; ampliados com Comunidade, APIs e Aulas.', arquivos: ['src/App.jsx', 'src/components/Navbar.jsx'] },
  { id: 'axios', url: base+'axios', publico: true, estado: 'integrado', tema: 'Requisições HTTP com Axios', aplicacao: 'Agora o backend usa cliente HTTP Axios com timeout, tratamento de status e cache nos adaptadores de APIs externas.', arquivos: ['server/src/httpClient.js', 'server/src/external.js'] },
  { id: 'userSystem', url: base+'userSystem', publico: true, estado: 'integrado', tema: 'Formulários, ViaCEP e IBGE', aplicacao: 'CEP, preenchimento automático de endereço, validação e estados/municípios integrados ao Perfil.', arquivos: ['src/pages/Perfil.jsx', 'server/src/external.js'] },
  { id: 'dom', url: base+'dom', publico: true, estado: 'conceito_aproveitado', tema: 'Interação e atualização da interface', aplicacao: 'Eventos e renderização declarativa feitos com React; evita manipulação direta do DOM em componentes.', arquivos: ['src/pages/Comunidade.jsx', 'src/pages/Integracoes.jsx'] },
]
