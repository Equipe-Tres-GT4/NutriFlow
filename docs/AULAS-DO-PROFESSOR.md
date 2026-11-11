# NutriFlow — rastreabilidade dos repositórios ensinados

**Data da conferência pública:** 10 de novembro de 2026.  
**Objetivo:** aplicar os conteúdos de forma útil, **sem duplicar código** e sem confundir repositórios de demonstração com funcionalidades obrigatórias.

## Resultado da pesquisa

A organização pública `https://github.com/orgs/gt4-tarde/repositories` listava `gt-store`, `gtres`, `axios`, `userSystem` e `dom`. Os links restantes informados pelo aluno não permitiram consultar código via acesso público. Isso **não prova** que esses repositórios foram excluídos: também podem estar privados ou requerer acesso autenticado. Por isso, não dizemos que copiamos ou analisamos os códigos privados.

| Repo e URL | Status de acesso | Tema observado/documentado | Aplicação concreta no NutriFlow | Evidência no projeto |
|---|---|---|---|---|
| [sequelize-api](https://github.com/gt4-tarde/sequelize-api) | Código inacessível publicamente | Backend com ORM (inferido do nome; não validado) | Sequelize já usado na API; aguardando código para comparar padrões | `server/src/models.js`, `server/src/app.js` |
| [sequelize-app](https://github.com/gt4-tarde/sequelize-app) | Código inacessível publicamente | Sequelize (inferido do nome) | Migrations versionadas **novas**, sem atribuir código inacessível à aula | `server/src/migrations.js`, `server/migrations/` |
| [express-api](https://github.com/gt4-tarde/express-api) | Código inacessível publicamente | Express (inferido do nome) | Rotas e middleware HTTP Express existentes e reorganizados | `server/src/app.js`, `server/src/middlewares.js` |
| [poo-js](https://github.com/gt4-tarde/poo-js) | Código inacessível publicamente | POO (inferido do nome) | Classe própria `ClienteHttp` encapsula cliente HTTP | `server/src/httpClient.js` |
| [gt-store](https://github.com/gt4-tarde/gt-store) | Público | Catálogo React/Vite, Bootstrap e apresentação de produtos | Reutilizar **conceito** de catálogo para alimentos; componentes React e Bootstrap já presentes. Não transplantar e-commerce. | `src/components/Catalogo.jsx`, `src/pages/Integracoes.jsx` |
| [NodeJs](https://github.com/gt4-tarde/NodeJs) | Código inacessível publicamente | Node.js (inferido do nome) | API já executa em Node; sem comparar conteúdo indisponível | `server/src/index.js` |
| [gtres](https://github.com/gt4-tarde/gtres) | Público | React 19 / React Router / Vite | Mantidos roteador e arquitetura React; novas páginas Comunidade, APIs e Aulas | `src/App.jsx`, `src/components/Navbar.jsx` |
| [axios](https://github.com/gt4-tarde/axios) | Público | Requisições/consumo de dados; inclui JSON local de usuários e produtos | **Novo:** `axios` no backend para consultar APIs externas com timeout e tratamento de status; `fetch` em testes simulados | `server/src/httpClient.js`, `server/src/external.js` |
| [userSystem](https://github.com/gt4-tarde/userSystem) | Público | `script.js` demonstra formulário, valida CEP, consulta ViaCEP, estados via IBGE e mensagens | Já usado no NutriFlow por backend e interface React; evita fazer buscas por scripts DOM duplicados | `src/pages/Perfil.jsx`, `server/src/external.js` |
| [dom](https://github.com/gt4-tarde/dom) | Público | Manipulação do DOM em JS | React aplica renderização por estado e eventos sem injetar DOM imperativamente | `src/pages/Comunidade.jsx`, `src/pages/Integracoes.jsx` |

## Progresso real, não apenas conceitos

- **Adicionado nesta revisão**: driver Axios opcional nos testes / obrigatório em execução normal, encapsulado em classe; gerenciador de migrations versionadas; middleware de origem e erros separado; testes de unidade dos módulos; página `/aulas`; endpoint `/api/learning/sources`; documentação Swagger correspondente.
- **Já estava funcional no código**: React/Vite, integração de CEP (ViaCEP/BrasilAPI), estados e municípios do IBGE, adaptação Open Food Facts/TheMealDB, autenticação bcrypt/JWT, CRUD social, testes de endpoints Jest, testes E2E Cypress e Swagger.
- **Não foi importado**: exemplos de e-commerce de produtos não alimentícios, scripts com manipulação DOM incompatível com React e práticas inseguras como armazenamento de senhas em texto puro.
- **Não foi possível auditar**: código-fonte efetivo dos cinco repositórios com acesso público indisponível. Para comparação rigorosa, pedir acesso à organização ou arquivos ZIP ao professor.

## Executando as migrations no lugar de `sequelize.sync()`

A partir desta versão, o servidor inicializa chamando `executarMigracoes(sequelize)`; uma tabela `_nutriflow_migrations` registra quais scripts foram aplicados. O esquema inicial está em `server/migrations/202611100001-criar-tabelas.js` e cria cinco tabelas com relacionamentos e índices.

```bash
cd server
npm install
npm run db:status
npm run db:migrate
npm run dev
```

- **Primeira execução:** em banco SQLite vazio, a migration cria as tabelas.
- **Quem já usou o ZIP anterior:** quando as cinco tabelas existentes têm o padrão esperado, o sistema registra a migration inicial como já aplicada (baseline), preservando os dados. Ainda assim, faça **backup do arquivo `server/data/nutriflow.sqlite`** antes de atualizar.
- **Banco parcial/incompatível:** a migração é interrompida para evitar dano a dados. Não use `sync({ force: true })` em banco com contas e publicações reais.
- **Migração futura:** crie um novo arquivo ordenável em `server/migrations/` com export `async function up(queryInterface, transaction)` e comando `npm run db:migrate`.
- **Limite:** as migrations não foram executadas aqui contra SQLite real porque o ambiente não possui dependências `sequelize`/`sqlite3` instaladas. Execute os testes Jest no computador antes da apresentação.

## Fluxo de versão sugerido para a equipe

1. Criar branch `feat/migrations`, integrar em `develop` mediante PR e registrar responsável/revisão.
2. Criar branch `feat/cliente-axios`, integrar mediante PR.
3. Criar branch `docs/referencias-aulas`, revisar links e capturas de tela.
4. Rodar `npm run build`, `npm run lint`, `npm --prefix server test` e `npm run test:e2e` antes de mergear para `main`.
5. Reunir histórico Git de todos integrantes como evidência de colaboração real.

## Referências públicas

- [GitHub — gt4-tarde](https://github.com/orgs/gt4-tarde/repositories)
- [gt4-tarde/userSystem — script.js](https://github.com/gt4-tarde/userSystem/blob/main/script.js)
- [gt4-tarde/axios](https://github.com/gt4-tarde/axios)
- [gt4-tarde/gt-store](https://github.com/gt4-tarde/gt-store)
- [gt4-tarde/gtres](https://github.com/gt4-tarde/gtres)
- [gt4-tarde/dom](https://github.com/gt4-tarde/dom)

> Material de aula é referência acadêmica. O código de produção deve ser reimplementado com validação, tratamento de erros, testes e documentação — não copiado cegamente.
