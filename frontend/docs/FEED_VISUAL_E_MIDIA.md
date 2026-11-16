# NutriFlow — Feed visual, fotos, vídeos e versões de receitas

## Jornada do usuário

1. **Descobrir:** `/comunidade` abre um feed de posts grandes em uma coluna. Pesquisar no campo superior ou ordenar por recentes, curtidas, salvas e autor. A lista de criadores não toma o foco.
2. **Interagir:** cada post mostra autor discreto com avatar, mídia de destaque, descrição, curtidas, favoritos, acesso aos comentários e link para os ingredientes. Curtidas, salvos e comentários são dados do banco, não estados decorativos.
3. **Conhecer quem criou:** nome/foto do autor leva a `/participantes/:id`, onde aparecem as demais receitas e a opção de seguir.
4. **Criar sua versão:** abrir detalhe, clicar "Criar minha versão". Os ingredientes/preparo da receita base são copiados para o formulário; ao publicar, uma nova receita e um novo post são criados. A origem é preservada por `receita_original_id`.
5. **Publicar conteúdo próprio:** usuário logado acessa `/receitas/cadastrar`; foto e vídeo podem ser enviados diretamente ou fornecidos por URL; todos os dados ficam no banco e aparecem no feed.
6. **Foto pessoal:** editar em `/perfil` -> selecionar foto -> salvar perfil. Os avatares DEMO são representações sintéticas de personagens fictícios.

## Novas migrations

`202611100005-midias-versoes.js` acrescenta `usuarios.foto_url`, `receitas.video_url`, `receitas.foto_credito`, `receitas.receita_original_id`, `publicacoes.video_url`. É aditiva e não apaga dados.

## Endpoints e dados

| Método e rota | Função |
|---|---|
| `POST /api/media` | Upload binário autenticado de imagem ou vídeo. `Content-Type` corresponde ao tipo do arquivo, corpo com bytes. Retorna `{url, tipo}`. |
| `GET /api/media/:nome` | Serve foto/vídeo enviados com nome UUID. |
| `POST /api/recipes` | Cria receita; aceita `imagemUrl`, `videoUrl` e `receitaOriginalId` opcional; cria post vinculado. |
| `PUT /api/recipes/:id` | Atualiza apenas receita própria, mantendo post sincronizado. |
| `GET /api/recipes/:id/versions` | Lista versões derivadas da mesma origem, com autor. |
| `GET /api/recipes/:id/post` | Recupera o ID do post usado para comentar na receita. |
| `GET /api/posts/:id/comments` | Lê comentários da receita/post. |
| `POST /api/posts/:id/comments` | Autenticado, cria comentário. |
| `POST /api/posts/:id/like` | Autenticado, alterna curtida. |
| `POST/DELETE /api/saved/recipes` | Guarda ou remove receita na coleção do usuário. |
| `PATCH /api/profile` | Persiste `fotoUrl` e demais dados privados, sem expor endereço publicamente. |

## Fotografias de demonstração

1. `npm run db:seed:demo` garante os 5 perfis fictícios e 25 receitas, preservando contas reais.
2. `npm run db:seed:media` consulta a API oficial do [Wikimedia Commons](https://commons.wikimedia.org/w/api.php) com termos relacionados ao prato e utiliza apenas arquivos que informam licença **CC0, CC BY, CC BY-SA ou domínio público**.
3. Quando o download funciona, a foto é copiada para `server/uploads/` e servida localmente; se falhar, mantém o link do Commons. O banco armazena a URL da foto e objeto `fotoCredito` contendo página de origem, autor, licença e indicação `ilustrativa=true`. O feed e o detalhe exibem o crédito.
4. A busca é uma **curadoria automatizada imperfeita**: pode não encontrar foto correspondente ou ser bloqueada por limite de rede. Fotografia não encontrada não é inventada; usa mídia anterior ou foto padrão local. Confira visualmente as 25 receitas na apresentação. O seed não confunde os perfis fictícios com autores reais das fotografias.
5. Não altere créditos/avisos da licença. Fotos de terceiros não são upload pessoal do usuário. A biblioteca de retratos DEMO em `public/demo/avatars` é sintética e não identifica pessoas reais.

**Fonte técnica:** [MediaWiki Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo); [licenças do Commons](https://commons.wikimedia.org/wiki/Commons:Licensing).

## Segurança, limites e implantação

- Somente autenticados podem enviar arquivos. O servidor inspeciona MIME e assinatura mágica; limita imagens a 8 MB e vídeos a 25 MB; gera nome aleatório UUID e não aceita caminho arbitrário.
- Não aceita SVG, GIF executável, HTML nem scripts como uploads. Ainda é recomendável usar antivírus, transcodificação de vídeos, isolamento de mídias, CDN/objeto storage e moderação antes de operar publicamente.
- URLs externas de fotos/vídeos devem vir de fontes confiáveis. YouTube é incorporado exclusivamente em domínio `youtube-nocookie.com` quando ID tem formato válido.
- Mídias enviadas ficam em `server/uploads/`: inclua em backup com `server/data/*.sqlite`; não acompanham o ZIP caso usuários as tenham criado depois.
- Um usuário comum só pode editar suas próprias receitas e publicações. Ao apagar uma receita original, versões de outros usuários permanecem, mas deixam de apontar para o registro excluído (`SET NULL`).
- O sistema é demonstração acadêmica, não serviço nutricional/médico. Para produção: verificar acessibilidade real em celulares, testes Cypress, política de conteúdo e uso de imagens, privacidade/LGPD, testes com dois usuários, moderação e segurança do upload.

## Roteiro de teste

```bash
# dentro de server
npm install
npm run db:migrate
npm run db:seed:demo
npm run db:seed:media
npm run test:all
npm run dev
# em outro terminal, na raiz
npm install
npm run dev
```

Acesse `/comunidade`; abra um post, curta, salve, comente e clique "Criar minha versão"; altere um ingrediente e publique; volte à receita original e confira a nova versão. Alterne para celular (375 px) nas ferramentas do navegador. Confirme que o perfil DEMO exibe aviso e que as imagens reais mostram atribuição. Se alguma busca de fotografia falhar, use o upload próprio na receita ou uma foto licenciada manualmente.
