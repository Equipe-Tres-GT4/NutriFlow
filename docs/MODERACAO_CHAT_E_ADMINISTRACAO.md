# NutriFlow — Chat, denúncias e administração

## Fluxos implementados

1. Quem criou uma receita vê **Excluir minha receita** no feed e no detalhe. A exclusão requer confirmação. Comentários, curtidas e receitas salvas ligados a ela são apagados; versões criadas por terceiros são preservadas, desvinculadas da receita excluída. Receitas de terceiros não podem ser excluídas por pessoas comuns.
2. Nas publicações de terceiros e nos perfis públicos existe **Denunciar**. O usuário escolhe motivo e detalhes. A equipe analisa a fila e escolhe **Manter** , **Remover publicação** ou **Orientar perfil**, sempre com justificativa.
3. O backend é a fonte de autorização: `papel=admin` (nunca confiando só na interface). Cadastro público recebe sempre `papel=usuario`, mesmo que envie `papel` no JSON.
4. Depois da decisão administrativa, o backend cria mensagens privadas da equipe para **autor** e **denunciante**, preservando o sigilo do denunciante em relação ao autor.
5. **Mensagens** oferece busca de pessoas, conversas privadas, histórico, indicação de não lidas e compartilhamento de uma receita por mensagem. A interface consulta a cada 7 segundos enquanto estiver aberta; não usa WebSocket.
6. **Minhas denúncias** mostra o status de denúncias da própria conta, sem expor o conteúdo sigiloso de investigações.

## Migrations e comandos

No diretório principal do projeto (com backend parado e após backup de `server/data`, `server/.env` e `server/uploads`):

```bash
npm install
npm run setup:api
npm run db:migrate
npm run db:status
npm run db:seed:admins
npm run test:all
npm run build
```

**Atenção à configuração das contas administrativas:** o comando `npm run db:seed:admins` lê `server/.admin-seed.local.json`, arquivo separado do código-fonte e listado no `.gitignore`. Copie o arquivo de credenciais entregue separadamente para esse nome antes de executar o comando. Ele deve conter exatamente cinco objetos `{ "nome": "...", "email": "...", "senha": "..." }` e as senhas devem ter no mínimo 16 caracteres.

O script de seed cria contas ausentes com senhas armazenadas como hash **bcrypt(12)**, sem inserir texto puro no SQLite. Quando executado novamente não altera a senha de administradores existentes. Se encontrar uma conta **comum** com qualquer e-mail configurado, interrompe sem promover essa conta. Em produção o provisionamento via arquivo é desabilitado.

**Nunca suba o arquivo de credenciais ao GitHub, envie a clientes, ou utilize senhas de demonstração em ambiente público.** Este projeto foi preparado para apresentação acadêmica em ambiente local. Para uso público é necessário implementar mudança inicial obrigatória de senha, recuperação de acesso, política de retenção, proteção de uploads e moderação mais robusta.

## Rotas principais (também no Swagger)

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/reports` | autenticado, alvo de outro autor |
| GET | `/api/reports/mine` | autenticado, denúncias próprias |
| GET | `/api/admin/reports?status=pendente` | **admin** |
| POST | `/api/admin/reports/:id/review` | **admin** |
| GET | `/api/messages/threads` | autenticado, somente conversas próprias |
| GET | `/api/messages/:userId` | autenticado, somente mensagens com esse interlocutor |
| GET | `/api/messages/unread` | autenticado |
| POST | `/api/messages` | autenticado |
| DELETE | `/api/recipes/:id` | autor da receita |
| DELETE | `/api/posts/:id` | autor da publicação |

Códigos: 400 validação, 401 sem login, 403 sem permissão, 404 ausente, 409 denúncia duplicada ou já revisada.

## Esquema

Migration `202611100007-mensagens-denuncias-administradores.js`: adiciona `papel` em `usuarios`, cria `mensagens` e `denuncias`, índices de consultas e chave única por denunciante + alvo. Não altera históricos existentes.

**Preservação de evidências:** após a exclusão, a denúncia mantém `titulo_snapshot`, motivo e decisão. O conteúdo original, por sua vez, é removido. Em implantação real, é recomendável ter política própria de retenção de evidências com controles de acesso e prazos definidos.

**Segurança atual:** a interface só exibe o painel para admins, mas a API também bloqueia acessos não autorizados. O envio de mensagens de moderação ocorre somente pelo endpoint de decisão, não podendo ser forjado no endpoint de mensagem comum. Não há notificação por e-mail, push nem moderação automática por IA. A troca de mensagens usa consultas periódicas (aprox. 7s) e exige backend ligado.
