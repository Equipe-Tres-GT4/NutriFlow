# NutriFlow — Versão unificada do frontend + servidor

Pacote elaborado a partir de `NutriFlow-main.rar` (frontend fornecido pelo usuário)
e `server.rar` (backend fornecido pelo usuário). Aplicadas correções de lint dos
componentes React, contextos de autenticação, imports e testes, preservando a
implementação real da página `src/pages/CadastrarReceita.jsx` que usa a API.

## IMPORTANTE: arquivo de entrega sem dados pessoais

Por segurança, o pacote NÃO contém:
- `server/.env` (senhas, tokens, JWT e configurações privadas)
- `server/.admin-seed.local.json` (credenciais administrativas)
- `server/data/` (banco principal de usuários e receitas)
- `server/uploads/` (imagens e arquivos enviados por usuários)
- `node_modules`, cache, screenshots e arquivos de build

Se atualizar uma instalação existente, NÃO apague a pasta anterior: faça um
backup e copie os arquivos da pasta `NutriFlow-main/` deste ZIP para o seu
projeto, mantendo os arquivos privados e o banco antigos. Na primeira instalação,
crie `server/.env` a partir de `server/.env.example`, configure uma nova
`JWT_SECRET` segura e execute as migrações. NÃO use a chave de exemplo em produção.

## Iniciar no Windows / Git Bash

Terminal 1:
```
cd ~/Documentos/NutriFlow-main
npm install
npm --prefix server install
npm run dev:api
```
Terminal 2:
```
cd ~/Documentos/NutriFlow-main
npm run dev
```
Frontend: http://localhost:5173/
API de saúde: http://127.0.0.1:3001/api/health

## Testes e qualidade
```
npm run test:offline
npm run lint
npm run build
npm run test:all
npm run test:e2e
```
O E2E sobe API e frontend separados nas portas 3002 e 5174 com SQLite temporário;
não precisa que as portas normais estejam ativas. O backend normal mantém os
limites HTTP 120/min (geral) e 30/15min (autenticação).

### O que foi verificado na preparação deste arquivo

- Extração e combinação do frontend e do backend reais.
- 20/20 testes offline do Node executados neste ambiente: PASSARAM.
- Inspeção sintática de 103 arquivos JS/JSX e 142 imports relativos: 0 erros.
- Validação de que `CadastrarReceita.jsx` continua publicando via API.
- Nenhuma credencial, SQLite real, upload privado ou `node_modules` foi empacotado.

### Testes que precisam ser executados no Windows

As dependências do frontend (React, Vite, ESLint, Cypress) e do servidor (Jest,
SQLite nativo) não estavam instaladas neste ambiente de preparação, então não
foi possível reproduzir `npm run lint`, `npm run build`, `npm run test:all` ou
`npm run test:e2e` sobre esta versão já refatorada. Antes da refatoração, o
usuário confirmou 11/11 Cypress e 20/20 testes offline em seu Windows. Esses
resultados anteriores NÃO substituem os testes desta entrega.

Se qualquer teste indicar erro, envie o log exato para uma correção pontual.
