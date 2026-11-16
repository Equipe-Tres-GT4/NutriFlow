# NutriFlow Frontend — React/Vite

Repositório independente. A API deve estar iniciada no outro repositório `nutriflow-backend` na porta 3001.

```bash
npm install
npm run dev
```

Acesse http://localhost:5173. O `vite.config.js` já encaminha `/api` para `http://localhost:3001` por padrão. Caso necessário, crie `.env` a partir de `.env.example` e ajuste `NUTRIFLOW_API_TARGET`.

Para os testes E2E com backend e MySQL reais, mantenha backend e frontend ativos e rode `npm run test:e2e` ou `npm run test:e2e:open`. Eles podem criar/alterar registros; utilize um banco de testes isolado, nunca a base real.

Os arquivos da pasta `docs/` documentam funcionalidades e história do projeto, inclusive referências à estrutura anterior com SQLite.
