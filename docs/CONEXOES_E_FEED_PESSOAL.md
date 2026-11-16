# NutriFlow — Conexões e feed personalizado

## Propósito

Oferecer uma comunidade de alimentação na qual cada pessoa escolhe os criadores que
quer acompanhar, sem substituir o feed de receitas por listas de perfis.

## Experiência no site

- Menu **Comunidade**: filtro Explorar (público), Seguindo, Seguidores e Amigos (logados).
- Cada receita tem avatar e nome do autor e botão discreto para seguir.
- Menu **Conexões**: descoberta com pesquisa de nomes, Seguindo, Seguidores e Amigos;
  cada pessoa tem avatar, quantidade de receitas e botão para seguir/deixar de seguir.
- Perfil de autor: informações públicas, número de seguidores e seguindo, estado da
  relação com o visitante e botão com ação explícita.
- Meu perfil: atalho para meus seguidores, contas que sigo e amigos mútuos.
- **Amizade mútua** significa que A segue B **e** B segue A. Não há mensagens privadas.
- Contas demonstrativas são identificadas; sem dados pessoais reais.

## Modelo de dados

Reutiliza `Seguidor` de `server/src/models.js`: `seguidor_id`, `seguido_id` e índice
único para impedir duplicatas. Não requer mudança destrutiva ou migration nova.
O seed adiciona 10 relações direcionais entre os perfis de demonstração.

## Contrato API

| Método | Rota | Autenticação | Resposta |
|---|---|---|---|
| GET | `/api/social/summary` | Obrigatória | `seguindo`, `seguidores`, `amigos` |
| GET | `/api/social/people?q=&page=1` | Obrigatória | `pessoas[]`, `total`, `pagina` |
| GET | `/api/social/connections?tipo=seguindo&page=1` | Obrigatória | `pessoas[]`, `total`, `pagina`, `tipo` |
| PUT | `/api/users/:id/follow` | Obrigatória | `seguindo`, `seguidores`, `meSegue`, `amigos` |
| DELETE | `/api/users/:id/follow` | Obrigatória | mesmos campos, seguindo=false |
| GET | `/api/users/:id` | Opcional | perfil público, contadores, `euSigo`, `meSegue`, `amigos` |
| GET | `/api/posts?feed=todos` | Opcional | feed global |
| GET | `/api/posts?feed=seguindo` | Obrigatória | somente autores seguidos |
| GET | `/api/posts?feed=seguidores` | Obrigatória | somente autores que seguem o visitante |
| GET | `/api/posts?feed=amigos` | Obrigatória | autores com relação recíproca |

`GET /api/posts` também suporta `q`, `autor`, `tipo`, `sort` e `salvas`, aplicados
em conjunto com a filtragem social. Paginação com 12 publicações por página.
As listas de pessoas retornam até 20 perfis por página. A interface nunca
revela `email`, `senhaHash`, `cep`, `logradouro`, `telefone`, `peso`, `restricoes`.

Para remover a conexão, o frontend usa `DELETE`, não um botão que alterna sem
saber o estado. `PUT` e `DELETE` são idempotentes; `POST` permanece somente
para compatibilidade com instalações antigas.

## Teste manual de aceitação

1. Rodar as migrations e `npm run db:seed:demo`.
2. Criar conta A, entrar, abrir Conexões e seguir a Marina fictícia.
3. Abrir Comunidade → Seguindo: aparecem somente postagens de quem A segue.
4. Comunidade → Explorar: continuam aparecendo receitas de vários autores.
5. Criar conta B e seguir A. A verá B em Seguidores (mesmo sem segui-lo).
6. A segue B de volta: os dois aparecem em Amigos, e o feed Amigos mostra
   somente as publicações de pessoas com vínculo recíproco.
7. Deixar de seguir B: B desaparece de Amigos e de Seguindo de A.
8. Conferir nas respostas públicas que não retornam e-mail ou endereço.
9. Rodar Jest e os testes offline: `npm run test:all` a partir de `server`.

## Limites

Este é um projeto acadêmico: sem notificações push, conversas privadas,
conta privada, bloqueio de usuário ou moderação avançada. Adicionar estes
recursos exigiria novas rotas e regras de privacidade. Para produção é
necessário testar carga, índices, paginação, acessibilidade e segurança.
