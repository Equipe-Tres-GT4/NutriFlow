# NutriFlow — arquitetura, avaliação e pendências

## Camadas

```text
React/Vite (frontend, porta 5173)
    ├── Início, Alimentos, Receitas (acervo local herdado do protótipo)
    ├── Comunidade (publicações, comentários, curtidas, seguidores)
    ├── Meu Perfil (cadastro e CEP + IBGE)
    └── Explorar APIs (fontes documentadas)
          │ fetch /api/...  (cookie JWT HttpOnly; Vite proxy)
          ▼
Express (backend, porta 3001)
    ├── /api/auth, /api/profile     → bcrypt + JWT
    ├── /api/posts, /api/comments   → Sequelize → SQLite
    ├── /api/users                 → perfis públicos/seguidores
    └── /api/integrations          → adaptadores + cache/timeout
                                           ├── Open Food Facts
                                           ├── TheMealDB
                                           ├── ViaCEP → BrasilAPI (fallback)
                                           └── IBGE Localidades
```

## Banco de dados (Sequelize / SQLite)

- `usuarios`: nome, e-mail único, hash de senha bcrypt, objetivo, dados opcionais de perfil e endereço.
- `publicacoes`: pertence a um usuário; título, conteúdo, tipo (`dica`, `receita`, `experiencia`) e URL de imagem opcional.
- `comentarios`: pertence a uma publicação e a um usuário.
- `curtidas`: associação única usuário–publicação.
- `seguidores`: associação única usuário que segue–usuário seguido.

**CRUD:** criar/listar/detalhar/editar/excluir publicações; criar/listar/excluir comentários; cadastro/consulta/edição do perfil; likes e seguir/desseguir.

Os resultados externos de produtos e receitas podem ser **compartilhados diretamente no feed** por usuários autenticados, com menção à fonte original.

## Critérios do professor

| Requisito | Implementação no projeto | Verificação |
|---|---|---|
| Jest (backend) | `server/tests/normalize.test.js`, `server/tests/api.test.js` | `cd server && npm test` |
| Cypress (frontend) | `cypress/e2e/nutriflow.cy.js` | `npm run test:e2e` com frontend e API rodando |
| JWT | Cookie HttpOnly de 2 h, issuer `nutriflow` | Login e `/api/auth/me` |
| dotenv | `server/.env.example`; `.env` ignorado | variável `JWT_SECRET` |
| bcrypt | Hash no cadastro, compare no login | Conta nunca retorna `senhaHash` |
| Sequelize (ORM) | Modelos e associações no backend | `server/src/models.js` |
| CRUD | Publicações, comentários, perfis | Swagger `/api/docs` |
| Tabelas | 5 modelos relacionados | SQLite gerado por migrations versionadas |
| Versionamento | `.gitignore` seguro; comandos Git no README; inventário das aulas | Ver histórico real de commits da equipe |
| Organização e colaboração | Fluxo de branches, revisão e divisão de tarefas sugeridos | Evidências reais a reunir pela equipe |
| Swagger | `server/src/swagger.js` e `/api/docs` | Abrir documentação e testar endpoints |
| APIs externas | 5 provedores + adaptadores/cache | Página `/integracoes` + `docs/APIS-EXTERNAS.md` |

## Limitações e próximos passos antes da entrega

1. **Instalação e testes em ambiente conectado:** o pacote foi editado sem acesso ao registro npm. A sintaxe do backend foi verificada; instalar dependências, executar Jest, Cypress e build e ajustar possíveis diferenças de ambiente.
2. **Dados legados:** o acervo antigo e os favoritos de receitas existentes ainda usam `localStorage`; já as novas publicações da comunidade são salvas em SQLite. Uma etapa posterior pode migrar todo o catálogo e favoritos para o banco, e implementar upload de imagens autenticado.
3. **Recuperação de senha:** a funcionalidade antiga era insegura (alterava senha apenas informando e-mail no navegador); foi removida. Para produção: fluxo de token de uso único enviado por e-mail, expiração e limites de tentativas.
5. **Segurança de produção:** migrations em vez de `sequelize.sync`, backups, HTTPS, proteção adicional contra spam/abuso, monitoramento e política LGPD para dados de saúde e endereço. Cookie `Secure` requer HTTPS quando `NODE_ENV=production`.
6. **APIs externas:** serviços podem ficar offline; ver documentos e condições. A chave de desenvolvimento da TheMealDB não substitui chave de produção.
7. **Git/equipe:** não é possível provar colaboração apenas com o ZIP sem o histórico `.git`. Registrar commits individuais, pull requests, tarefas por pessoa, revisões e apresentação.
8. **Responsividade/usabilidade:** validar manualmente em desktop e celular, navegação por teclado, tratamento de links externos e estados vazios.

## Divisão possível da equipe

- **Pessoa 1:** backend, autenticação JWT/bcrypt, segurança e perfis.
- **Pessoa 2:** modelos, Sequelize e endpoints CRUD.
- **Pessoa 3:** React, integração UI/comunidade, acessibilidade e responsividade.
- **Pessoa 4:** integrações externas, Swagger, Jest/Cypress, README e QA.

Use branches `feat/auth`, `feat/comunidade`, `feat/apis` e `feat/testes`; integrar via pull request para `develop`, revisando no mínimo um colega antes do merge para `main`. Adapte à quantidade real de membros.

## Revisão com repositórios da turma

Veja [`AULAS-DO-PROFESSOR.md`](AULAS-DO-PROFESSOR.md) para a matriz com 10 links, cinco públicos acessíveis, a implementação de Axios, POO, middlewares e migrations e a distinção entre **conteúdo confirmado** e **inferência a partir de nome**. A página `/aulas` reproduz o inventário como dado do backend (`/api/learning/sources`).
