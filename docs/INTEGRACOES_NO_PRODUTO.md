# NutriFlow — integrações no fluxo real de uso

## Princípio de arquitetura

O usuário não visita uma "página de APIs" para consumir dados. Ele procura alimentos, prepara receitas, cadastra uma conta, consulta a comunidade e guarda sua coleção pessoal. Os provedores externos são adaptadores do backend (`server/src/external.js`); o frontend usa apenas `src/service/api.js` e as rotas internas `/api`.

| Jornada no site | Serviço externo | Onde funciona | Dados persistidos na nossa base |
|---|---|---|---|
| Criar conta | ViaCEP (fallback BrasilAPI) e IBGE Localidades | `/cadastro`, CEP, UF e cidade (lista local de UFs em caso de falha do IBGE) | Endereço **opcional**, privado, vinculado ao usuário |
| Editar conta | ViaCEP, BrasilAPI e IBGE | `/perfil`, CEP, UF e cidade (cidade editável se a consulta falhar) | Perfil atualizado por PATCH |
| Pesquisar rótulos | Open Food Facts | `/receitas/cadastrar`, pesquisa de ingredientes por nome (a API também aceita código de barras) | Resultado externo consultado sob demanda; somente **referência** é salva na coleção |
| Informar alimento ausente | Nenhuma chamada externa obrigatória | API interna `POST /api/foods` (rota mantida para integrações futuras; não há mais página independente) | Alimento, autor e nutrientes/100g; autor pode editar e excluir |
| Consultar receitas | TheMealDB | `/receitas`, busca por nome e botão `Surpreenda-me` | Resultado externo consultado sob demanda; **referência** é salva na coleção |
| Compartilhar receita | API interna | `/receitas/cadastrar` | Receita com ingredientes/preparo, publicação vinculada no feed, autor e fotos via URL |
| Acompanhar comunidade | API interna (Express/Sequelize) | `/comunidade` | Publicações, comentários, curtidas e seguidores |
| Guardar conteúdo | API interna | `/salvos` | Favoritos por usuário, sincronizados no SQLite |

## Contratos

**Alimentos.** `GET /api/foods?q=aveia` consulta alimentos da comunidade (Sequelize, campo `nome` e `marca`) e produtos do Open Food Facts (com cache e rate limit). Um `q` com 8 a 14 dígitos é tratado como código de barras. `GET /api/foods` sem termo não chama a API externa. Resposta: `{alimentos: [...], fonteExterna, aviso?}`. O campo `fonte` identifica conteúdo colaborativo e conteúdos externos. Os nutrientes são quantidades por 100g/100ml e podem estar indisponíveis (nunca preenchidos com zero fictício).

**Cadastro local de alimentos.** `POST /api/foods`, `PUT /api/foods/:id`, `DELETE /api/foods/:id` usam JWT HttpOnly. Só o autor edita e remove. Campos: `nome`, `marca?`, `codigoBarras?`, `imagemUrl?`, `calorias100g?`, `proteinas100g?`, `carboidratos100g?`, `gorduras100g?`.

**Coleção de alimentos.** `GET/POST /api/saved/foods`; `DELETE /api/saved/foods/:chave`. Referências `local:<id>` e `off:<código de barras>` são confirmadas no servidor antes de gravar. Não confie nos dados enviados pelo navegador para identificar a marca/nome.

**Receitas.** `GET /api/recipes` lista as receitas cadastradas no site. `GET /api/recipes?q=chicken` agrega resultados externos da TheMealDB; caso esteja indisponível, devolve resultados locais e um `aviso`. `GET /api/recipes/surprise` consulta uma sugestão aleatória. `GET /api/recipes/:chave` aceita `local:<id>` e `externa:<id>`; o detalhe externo pode estar em inglês.

**Receita criada por usuário.** `POST /api/recipes` recebe `nome`, `ingredientes: string[]`, `preparo`, `tempoMin`, `dificuldade`, `imagemUrl?`. Cria a receita estruturada e uma publicação vinculada na comunidade. `PUT /api/recipes/:id` atualiza ambos; `DELETE` exclui a receita e a publicação vinculada. Tudo no SQLite, sem localStorage como fonte de dados. Texto validado no backend.

**Coleção de receitas.** `GET/POST /api/saved/recipes`; `DELETE /api/saved/recipes/:chave`. Guarda referências externas e locais (`externa:<id>` e `local:<id>`), não uma cópia integral da receita de terceiros. A API valida a referência antes de guardar.

**Localização.** `GET /api/integrations/location/cep/:cep` utiliza ViaCEP, com contingência na BrasilAPI para indisponibilidade (não para CEP inexistente). `GET /api/integrations/location/states` consulta o IBGE e dispõe de cópia local das 27 UFs como contingência. A consulta de municípios informa `modoManual: true` quando o IBGE não responde, sem impedir o preenchimento do campo Cidade. Os formulários enviam cidade, UF e CEP à API de cadastro ou edição de perfil; endereços não são mostrados publicamente.

## APIs usadas e atribuição

- Open Food Facts: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/ — dados colaborativos; respeitar ODbL, atribuição, limites e identificação por User-Agent. Buscar nomes usa endpoint de busca textual legado.
- TheMealDB: https://www.themealdb.com/docs_api_guide.php — chave `1` apenas para desenvolvimento/educação. **Site público comercial exige rever condições e obter chave apropriada**.
- ViaCEP: https://viacep.com.br/ — acesso por CEP, sem uso massivo.
- BrasilAPI: https://brasilapi.com.br/docs — contingência de CEP, sujeita a disponibilidade.
- IBGE Localidades: https://servicodados.ibge.gov.br/api/docs/localidades — fonte de UFs e municípios, respostas em cache.

As cinco fontes são identificadas em `server/src/external.js` e documentadas em `server/src/swagger.js`. Swagger é interface para desenvolvedores, não uma seção da rede social. A consulta de conteúdo externo depende de conectividade: nenhum provedor externo é controlado pelo NutriFlow. Não afirmar disponibilidade em tempo real sem testar a rede.

## Segurança e privacidade

- Usuários: JWT com cookie HttpOnly/SameSite, senhas bcrypt e validação de campos.
- Endereços e dados corporais são privados; perfis públicos expõem apenas nome, ID, data de criação e contagem de seguidores.
- APIs externas são consultadas pelo backend; senhas e tokens não são enviados a provedores de CEP/alimentos/receitas.
- Coleções, edição e exclusão exigem login e verificam dono/usuário no servidor.
- Fotos e vídeos podem ser enviados ao backend pela rota autenticada de mídia. O arquivo é validado e armazenado localmente para o projeto acadêmico.
- Limites e regras de licença de cada serviço precisam ser revisados antes de publicar comercialmente.
- Em produção pública, implementar backup automatizado, HTTPS, gestão de consentimento, política de privacidade, moderação, monitoramento e limites por usuário.

## Verificação manual funcional

1. Crie conta preenchendo CEP, busque endereço; selecione UF e município.
2. Volte a `/perfil` e confirme persistência do endereço; teste edição.
3. Na criação de receitas (`/receitas/cadastrar`), pesquise o ingrediente `aveia`. O resultado deve indicar a fonte Open Food Facts ou comunidade.
4. A manutenção de alimentos cadastrados continua disponível via API documentada no Swagger; não há tela isolada de alimentos.
5. Em `/receitas`, pesquise `chicken`; abra detalhe; salve. Use `Surpreenda-me`.
6. Cadastre uma receita, confirme a página da receita e a postagem correspondente na comunidade; edite a receita e confira a atualização do feed.
7. Entre com outro usuário: leia e comente, mas não edite a receita do primeiro usuário.
8. Em `/salvos`, confirme as receitas e alimentos salvos na conta, saia, entre novamente e confirme persistência.
9. Abra `http://localhost:3001/api/docs/` para conferir a documentação OpenAPI sem precisar expor links das aulas na navegação.

## Migrations e testes

- `202611100001` cria autenticação e comunidade.
- `202611100002` cria alimentos, receitas e coleções.
- `202611100003` adiciona vínculo entre receita e publicação no feed.
- Jest/Supertest testa CRUD e permissões sem chamar provedores externos; testes `node:test` simulam os adaptadores offline; Cypress cobre cadastro, catálogo e publicação no navegador.
