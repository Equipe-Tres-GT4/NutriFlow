# NutriFlow Backend — MySQL

Repositório independente com Express, Sequelize, JWT, Swagger e migrations. **Não armazene `.env` no Git.**

## 1. Criar o banco
No MySQL Workbench ou MySQL Shell (`\sql`), execute `sql/01-criar-banco.sql` e troque `SENHA_FORTE_AQUI` por uma senha forte. Ajuste `DB_PASSWORD` em `.env` para a mesma senha.

## 2. Instalar e configurar
```bash
npm install
cp .env.example .env
# edite .env: JWT_SECRET, DB_PASSWORD
npm run db:migrate
npm run db:status
npm run db:seed:demo
npm run db:seed:admins
npm run dev
```
No PowerShell use `Copy-Item .env.example .env` em vez de `cp` se preferir.

## 3. Testar
- http://127.0.0.1:3001/api/health
- http://127.0.0.1:3001/api/docs
- `npm run doctor`
- `npm run test:offline` (testes Node independentes do MySQL)
- `npm test` (testes de integração usam SQLite isolado apenas em ambiente `NODE_ENV=test`; executar com esse ambiente definido)

## 4. Importar antigo SQLite (opcional)
O backup enviado é anterior às mídias. Se você tiver o banco SQLite ativo atualizado, priorize esse arquivo. Execute as 7 migrations MySQL primeiro. Depois:
```bash
npm run db:import:sqlite -- "C:/caminho/para/nutriflow.sqlite"
```
O importador recusa tabelas de destino com dados, preserva IDs, verifica relações e não toca em arquivos de mídia. **Faça backup de ambos os bancos e leia a saída.** Não execute seeds antes da importação. Se já executou seeds, use um MySQL novo e vazio em vez de apagar os dados existentes.

## Atenção
Migrations DDL no MySQL não são transacionais; uma falha parcial requer inspeção manual. Não execute `sync({ force: true })` nem apague tabelas em banco com dados. O repositório não contém banco ativo, `.env` nem credenciais pessoais.
