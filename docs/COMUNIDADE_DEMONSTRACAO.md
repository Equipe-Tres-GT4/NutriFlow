# Comunidade NutriFlow — feed de receitas e demonstração

## Experiência para o visitante

`/comunidade` agora começa com receitas publicadas (não com um formulário de cadastro).
Oferece pesquisa por nome, título e ingredientes, filtro de autor, tipo de conteúdo,
ordenação por **Mais recentes**, **Mais curtidas** ou **Mais salvas**, e opção
**Minhas salvas** para contas autenticadas. Os perfis podem ser selecionados nos
cartões de criadores. O formulário para compartilhar uma dica é opcional; para
cadastrar receita estruturada, o botão leva a `/receitas/cadastrar`.

As receitas exibidas são entidades reais no banco SQLite, ligadas às publicações
por `receita_id`. Abrir uma receita carrega os ingredientes, tempo e modo de
preparo. Curtir, salvar, comentar, seguir e publicar usam rotas da API e persistem
os registros no SQLite, não em variáveis de memória do React.

## Preparação do ambiente acadêmico

Execute na pasta principal:

```bash
cd ~/Documentos/NutriFlow-main
npm run db:migrate
npm run db:seed:demo
npm run dev:api
```

Em outro terminal, execute `npm run dev`. Entre em `http://localhost:5173/comunidade`.
`db:seed:demo` também pode ser executado diretamente em `server`.

**Execute o seed apenas em bancos de desenvolvimento/avaliação.** Ele não é
executado automaticamente em produção, é idempotente, preserva contas existentes
e não remove dados. O comando cria cinco contas fictícias com domínio reservado
`.invalid` e senhas aleatórias desconhecidas (não é possível autenticar-se nelas).
Para testar ações, cadastre uma conta própria. As contas fictícias têm selo
**DEMO**, inclusive no retorno das APIs. Curtidas, comentários e salvos de
perfil fictício são interações artificiais de demonstração, não métricas reais.

## Cinco perfis e necessidades alimentares

| Pessoa fictícia | Interesse alimentar | Receitas |
|---|---|---:|
| Marina Costa | Sem lactose | 5 |
| Carlos Menezes | Preparos com menos sal | 5 |
| Aline Rocha | Sem glúten, atenção à contaminação cruzada | 5 |
| Joana Oliveira | Receitas econômicas | 5 |
| Bruno Ferreira | Culinária vegetariana | 5 |

São 25 receitas **diferentes**, cada uma com ingredientes, tempo de preparo,
nível de dificuldade e instruções próprias. Dados e perfis são inteiramente
fictícios e utilizados para validar navegação, filtros, bookmarks, feed e busca.
Receitas não constituem prescrição nutricional para doenças ou alergias.

## API e banco

- `GET /api/community/authors` retorna autores que publicaram receitas, sem e-mails ou endereços.
- `GET /api/posts?tipo=receita&sort=recentes` alimenta o feed padrão.
- `GET /api/posts?tipo=receita&sort=salvas` ordena por número de salvos.
- `GET /api/posts?tipo=receita&sort=populares` ordena por curtidas.
- `GET /api/posts?tipo=receita&autor=ID` exibe apenas o autor selecionado.
- `GET /api/posts?tipo=receita&salvas=minhas` requer sessão, retorna receitas salvas pelo usuário.
- `POST /api/posts/:id/like` curte/descurte com autenticação.
- `POST /api/saved/recipes` salva uma receita na coleção; `DELETE /api/saved/recipes/:chave` remove.
- `GET /api/posts/:id/comments` e `POST /api/posts/:id/comments` leem/criam comentários.
- `GET /api/users/:id` permite ver perfil público, sem dados privados.

A migration `202611100004-perfis-demonstracao.js` adiciona `usuarios.is_demo`
com valor padrão `false`, preservando os cadastros anteriores.

## Como apresentar e validar

1. Abra a Comunidade sem login: cards aparecem e cada autor tem selo DEMO.
2. Selecione Marina: o feed passa a mostrar as cinco receitas dela.
3. Ordene por **Mais salvas**: o total reflete `receitas_salvas` do banco.
4. Digite "lentilha" na busca, clique Buscar e confira os resultados.
5. Cadastre um usuário real; salve e curta uma receita, faça um comentário.
6. Marque **Minhas salvas** e confira se somente a receita guardada aparece.
7. Abra **Meus salvos**, verifique a persistência e retorne à Comunidade.
8. Entre em um perfil fictício e acesse a receita completa, com ingredientes e preparo.
9. Execute `npm run db:seed:demo` de novo e confirme que os 25 registros não duplicaram.
10. Execute `npm run test:all` no backend e `npm run build` no frontend.

As consultas ao Open Food Facts, TheMealDB, ViaCEP/BrasilAPI e IBGE continuam
nas jornadas apropriadas de Alimentos, Receitas e Cadastro; este seed local
não depende do acesso à internet nem coloca conteúdo fictício nesses serviços.
