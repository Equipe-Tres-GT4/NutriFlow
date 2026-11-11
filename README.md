# NutriFlow — Comunidade alimentar, mensagens e moderação

O NutriFlow inclui feed visual de receitas, favoritos, seguidores, amizades, versões de receitas, chat privado, envio de receitas por mensagem, denúncias e painel de moderação para administradores.

**Atualização de novembro de 2026:** veja `docs/MODERACAO_CHAT_E_ADMINISTRACAO.md` para configuração das cinco contas administrativas, migração aditiva, permissões, exclusão de receitas e testes. As credenciais de demonstração são entregues em arquivo **separado**, nunca incluídas no repositório.

# NutriFlow — comunidade alimentar

Rede social acadêmica construída em React/Vite + Node/Express + Sequelize/SQLite. **APIs externas integram as funções reais do produto**, não aparecem como laboratório de exercícios: cadastro e perfil (CEP/IBGE), busca de alimentos (Open Food Facts), receitas (TheMealDB) e favoritos por usuário.

## Funcionalidades principais

- **Conta e perfil:** cadastro/login JWT em cookie HttpOnly, senha com bcrypt, dados privados e endereço opcional com busca de CEP, UF e cidade. Estados funcionam mesmo se o IBGE estiver temporariamente fora do ar; a cidade permanece editável.
- **Ingredientes nas receitas:** consulta por nome ou código de barras pela API interna de alimentos/Open Food Facts durante o cadastro de receitas. Não existe mais uma seção isolada de Alimentos no menu.
- **Receitas:** busca por nome (comunitárias e internacionais), surpresa aleatória, ingredientes/preparo, publicação por usuário, edição/exclusão pelo autor e salvos persistidos.
- **Comunidade (página inicial):** feed, comentários, curtidas, exclusão/edição do autor e seguir usuários; a rota `/` abre diretamente `/comunidade`.
- **Documentação:** Swagger e mapeamento de provedores na pasta `docs/`.

## Iniciar no Windows (Git Bash)

Faça backup de `server/data/nutriflow.sqlite` e do seu `.env` **antes de substituir uma versão anterior**. Não compartilhe o `.env` nem a pasta do banco.

### Terminal 1 — backend

```bash
cd ~/Documentos/NutriFlow-main/server
npm install
cp .env.example .env  # apenas se ainda não existe
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Abra `server/.env`, cole a chave gerada no campo `JWT_SECRET`, confirme que `PORT=3001` e depois execute:

```bash
npm run db:status
npm run db:migrate
npm run test:all
npm run dev
```

**Importante:** a atualização para o feed visual acrescenta a migration `202611100005-midias-versoes.js`. Migrations anteriores devem continuar como APLICADA. Não exclua o banco. O servidor também verifica migrations automaticamente no boot.

### Terminal 2 — frontend

```bash
cd ~/Documentos/NutriFlow-main
npm install
npm run dev
```

- Interface: http://localhost:5173
- Backend: http://localhost:3001/api/health
- Swagger: http://localhost:3001/api/docs/

**O site não abre em `localhost:3001`:** esse é o servidor da API. Em sua raiz `/`, o backend redireciona para o Swagger. O Vite faz proxy `/api` para o backend, permitindo que o site se conecte à API sem expor um domínio diferente.

## Testar

Na pasta `server`:

```bash
npm run test:offline  # adaptadores externos e middlewares com mocks
npm test              # Jest + Supertest + SQLite em memória
npm run db:status
```

Na raiz (com backend e frontend ativos):

```bash
npm run build
npm run test:e2e
npm audit
```

Os testes Cypress precisam dos dois servidores abertos. Execute `npm audit` também dentro de `server`; investigue dependências vulneráveis antes de usar `npm audit fix --force`.

## Onde cada serviço é utilizado

Leia **[`docs/INTEGRACOES_NO_PRODUTO.md`](docs/INTEGRACOES_NO_PRODUTO.md)** para o mapa de telas, entradas, endpoints, saída, armazenamento, segurança, fontes, atribuição e cenário de indisponibilidade. A especificação OpenAPI é disponibilizada em `/api/openapi.json` e visualizada no Swagger.

### Observações para entrega e publicação

- É um **projeto acadêmico**, não um serviço médico ou nutricional. Informação colaborativa pode estar incompleta; usuários devem conferir embalagens.
- Para publicar comercialmente, obtenha licença/chave de uso da TheMealDB, revise atribuições Open Food Facts, implemente HTTPS, política de privacidade, moderação, monitoramento e backups.
- Upload de fotos JPG/PNG/WebP (8 MB) e vídeos MP4/WebM (25 MB) é suportado localmente para receitas/perfis. Para produção, adote armazenamento externo, antivírus, política de retenção e moderação. Mensageria privada não está implementada.
- O sistema usa SQLite para simplificar a demonstração acadêmica. Em crescimento/produção, considerar PostgreSQL e gerenciamento de mídia externo.
- O código de padrões ensinados nas aulas foi adaptado ao contexto do produto (Express, Sequelize, middleware, migrations, cliente HTTP Axios, React e testes); nenhum link ou lista de exercícios precisa aparecer na interface.

## Comunidade de demonstração (5 perfis / 25 receitas)

Para exibir exemplos completos no feed `/comunidade`, execute **uma vez** após
as migrations, na raiz do projeto:

```bash
npm run db:migrate
npm run db:seed:demo
npm run db:seed:media  # procura fotografias reais com licenças abertas no Wikimedia Commons
```

Em seguida inicie o backend com `npm run dev:api` e o frontend em outro terminal
com `npm run dev`. O seed pode ser repetido sem duplicar os exemplos. Ele não
substitui contas existentes e não roda automaticamente: use apenas no ambiente
de desenvolvimento e na apresentação acadêmica. Os perfis fictícios aparecem
com selo **DEMO**; não são usuários reais. Para testar ações, cadastre uma conta.

Veja [`docs/COMUNIDADE_DEMONSTRACAO.md`](docs/COMUNIDADE_DEMONSTRACAO.md) para
o mapa de telas, endpoints e roteiro de testes.

## Feed social estilo Instagram / versões de receitas

- Em **Comunidade**, cada publicação ocupa **uma linha grande** (sem mosaico), com autor discreto, foto/vídeo, legenda, curtidas, salvos, comentário e ações para ver ingredientes ou criar versão própria.
- Em **Receita → Criar minha versão**, os ingredientes e o preparo são copiados para edição; a nova receita recebe `receitaOriginalId`, ganha publicação independente e preserva a referência do original.
- A tela de **detalhes** exibe foto, vídeo (upload MP4/WebM ou YouTube), ingredientes, preparo, comentários do post e versões existentes.
- Em **Meu perfil**, o usuário envia uma foto e decide se salva a alteração. As contas DEMO têm avatares sintéticos gerados para demonstração, **não fotografias das pessoas fictícias**.
- O script **`npm run db:seed:media`** é opcional, mas recomendado para a apresentação: procura fotografias reais correspondentes aos pratos no Wikimedia Commons, filtra licenças abertas e tenta armazenar uma cópia local com URL, autoria e licença. Depende de internet e pode não encontrar uma foto apropriada para toda receita; nesses casos mantém a imagem anterior ou uma foto ilustrativa padrão. **Verifique a adequação visual de cada resultado antes de publicar**.
- Armazenamento de mídias enviadas: pasta `server/uploads` (faça backup junto com `server/data`). A pasta não deve ser enviada ao GitHub. O vídeo da API é um link de vídeo hospedado ou mídia enviada, não captura/codificação no servidor.

Leia [`docs/FEED_VISUAL_E_MIDIA.md`](docs/FEED_VISUAL_E_MIDIA.md) para endpoints, fluxo dos testes e limitações.


## Conexões, seguindo e amizades — novo

A área **Conexões** (`/conexoes`) funciona com as relações reais gravadas na tabela
`seguidores` do Sequelize (que já existia, portanto **não há migration nova para
seguidores**). São quatro abas:

- **Descobrir pessoas:** buscar participantes por nome e seguir/seguir de volta.
- **Seguindo:** quem você acompanha, com botão para deixar de seguir.
- **Seguidores:** quem acompanha seu perfil; o usuário pode retribuir.
- **Amigos:** quando **ambos se seguem** (reciprocidade). Não são mensagens privadas.

Na **Comunidade** existem feeds **Explorar / Seguindo / Seguidores / Amigos**.
Os filtros são executados no backend em `GET /api/posts?feed=...` por identidade
autenticada, nunca apenas filtragem local no navegador. Uma conta nova tem o
feed Seguindo vazio até acompanhar alguém. O feed Explorar permanece público.
O cabeçalho do perfil oferece atalhos aos contadores de conexões. As sugestões
não utilizam dados médicos, endereço nem outras informações privadas.

### APIs sociais

| Verbo | Rota | Efeito |
|---|---|---|
| GET | `/api/social/summary` | Contadores: seguindo, seguidores, amigos |
| GET | `/api/social/people?q=...&page=1` | Pesquisar participantes com relacionamento atual |
| GET | `/api/social/connections?tipo=seguindo` | Quem sigo (`seguidores`, `amigos` também aceitos) |
| PUT | `/api/users/:id/follow` | Seguir pessoa (idempotente) |
| DELETE | `/api/users/:id/follow` | Deixar de seguir (idempotente) |
| GET | `/api/posts?feed=seguindo` | Feed apenas de quem sigo (`seguidores`, `amigos` também) |

Todas as novas rotas sociais de gerenciamento exigem cookie JWT. Um usuário
não pode seguir a própria conta. A API de pessoas **não retorna** e-mail,
telefone, CEP, endereço, senha, peso ou restrições alimentares.

O seed de demonstração também cria **10 relações direcionais** entre os cinco
perfis fictícios (algumas são mútuas). Execute `npm run db:seed:demo` novamente
para adicionar essas relações; a operação é idempotente e não altera os dados
de usuários reais. A conta real criada para apresentação deve seguir esses
perfis pela tela `/conexoes`, pois o seed **não segue ninguém por ela**.

Teste as novas relações com `npm run test:all`. O arquivo
`server/tests/social.test.js` testa os feeds personalizados, a reciprocidade,
a autorização, as relações idempotentes e a proteção dos dados públicos. Para
testar pela interface com Cypress, mantenha os dois servidores executando e
rode `npm run test:e2e`. Consulte `docs/CONEXOES_E_FEED_PESSOAL.md`.

## Ajuste de navegação e localidades (versão atual)

A **Comunidade** é a tela principal, acessível desde `/`. Os menus Início e Alimentos foram removidos; receitas, conexões, salvos e perfil permanecem. O catálogo de alimentos não foi excluído do backend: ele é consultado no cadastro de receitas.

Para corrigir a lista vazia de estados, o backend consulta o IBGE e, caso o serviço esteja indisponível, apresenta a lista de 27 UFs de reserva (`server/src/localidades.js`). Os formulários agora exibem um aviso claro; municípios podem ser digitados manualmente se a integração falhar. Consulte `docs/LIMPEZA_NAVEGACAO_E_LOCALIDADES.md`. **Não é necessário alterar o banco de dados nem rodar uma migration adicional** para essa atualização.
