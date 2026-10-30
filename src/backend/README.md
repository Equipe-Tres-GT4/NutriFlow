# NutriFlow API

API local de autenticação com Express e PostgreSQL. As senhas são armazenadas com bcrypt e a sessão usa um cookie HttpOnly.

## Iniciar localmente

Na pasta `src/backend`:

1. Copie `.env.example` para `.env` e gere um valor aleatório para `JWT_SECRET` com pelo menos 32 caracteres.
2. Inicie o PostgreSQL com `docker compose up -d database`.
3. Execute `npm install` e `npm run dev`.
4. Verifique `http://localhost:3000/api/health`.

O arquivo `.env` contém credenciais locais e não deve ser enviado ao GitHub.

## Rotas para testar no Insomnia

Use `http://localhost:3000` como base. Configure o corpo das requisições como JSON.

| Método | Rota | Corpo | Resultado esperado |
| --- | --- | --- | --- |
| GET | `/api/health` | nenhum | API e banco conectados |
| POST | `/api/auth/register` | `{"nome":"Ana","email":"ana@example.com","senha":"senha-teste-123"}` | `201` e usuário criado |
| POST | `/api/auth/login` | `{"email":"ana@example.com","senha":"senha-teste-123"}` | `200` e cookie de sessão |
| GET | `/api/auth/me` | nenhum | `200` e usuário da sessão |
| POST | `/api/auth/logout` | nenhum | `204` e cookie removido |

O Insomnia deve manter o cookie recebido no login para as chamadas autenticadas seguintes.
O cadastro existente no `localStorage` do frontend não é migrado automaticamente por esta API. A integração do React e uma migração controlada dos usuários são etapas separadas.