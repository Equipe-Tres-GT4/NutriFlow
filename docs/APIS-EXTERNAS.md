# NutriFlow — catálogo de APIs externas (10/11/2026)

## Objetivo

Adicionar informações úteis **sem inventar dados nutricionais**, mantendo a identificação do fornecedor e a documentação técnica. O navegador chama somente `/api/integrations/...` no backend próprio. Os adaptadores em `server/src/external.js` normalizam os dados, tratam falhas, definem tempo de resposta (timeout de 7 segundos), cache e limites internos. O usuário vê as fontes na página **/integracoes**.

| Serviço | Função na aplicação | Endpoint nosso | Serviço externo / documentação |
|---|---|---|---|
| Open Food Facts | Dados de produtos por código de barras | `GET /api/integrations/foods/:barcode` | `GET https://world.openfoodfacts.org/api/v3/product/{code}` — https://openfoodfacts.github.io/documentation/docs/Product-Opener/v3/products/get-api-v3-product-code/ |
| Open Food Facts | Pesquisa por nome de produto | `GET /api/integrations/foods/search?q=granola` | `GET https://world.openfoodfacts.org/cgi/search.pl` — busca textual legada |
| TheMealDB | Buscar receitas internacionais | `GET /api/integrations/recipes/search?q=chicken` | `GET https://www.themealdb.com/api/json/v1/1/search.php?s=chicken` — https://www.themealdb.com/docs_api_guide.php |
| TheMealDB | Receita por ID / aleatória | `GET /api/integrations/recipes/:id`, `GET /api/integrations/recipes/random` | `lookup.php?i={id}` e `random.php` |
| ViaCEP | Consultar e preencher endereço | `GET /api/integrations/location/cep/:cep` | `GET https://viacep.com.br/ws/{cep}/json/` — https://viacep.com.br/ |
| BrasilAPI | Reserva de consulta CEP em falhas transitórias do ViaCEP | mesmo endpoint de CEP | `GET https://brasilapi.com.br/api/cep/v2/{cep}` — https://brasilapi.com.br/docs |
| IBGE Localidades | Listar UFs e municípios | `GET /api/integrations/location/states` e `GET /api/integrations/location/states/:uf/cities` | `https://servicodados.ibge.gov.br/api/v1/localidades/` — https://servicodados.ibge.gov.br/api/docs/localidades |

## Limites, licenças e cuidados

1. **Open Food Facts:** o provedor documenta 10 buscas/min/IP e 15 leituras de produto/min/IP. Nosso adaptador adota limite interno conservador de 8/minuto para essas chamadas (por instância), cache de 15 min para busca e de 24 h para leitura de produtos. **Não fazer busca a cada tecla.** A base é licenciada sob ODbL, conteúdos sob Database Contents License e imagens tipicamente CC BY-SA: atribuição e obrigações de compartilhamento devem ser respeitadas. O User-Agent do app pode ser configurado em `OPENFOODFACTS_USER_AGENT`. Para dados confiáveis, conferem-se rótulos e unidades. Documentação: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
2. **TheMealDB:** chave `1` só para estudos, desenvolvimento e projetos pessoais; obter credencial adequada antes de publicar um serviço comercial/público. Filtros avançados premium não são implementados. Receitas costumam estar em inglês e não são classificadas automaticamente como saudáveis. Documentação: https://www.themealdb.com/docs_api_guide.php
3. **ViaCEP:** CEP precisa conter oito números; a API pode retornar `erro: true`. Cadastro de endereço é preenchido com confirmação do usuário, nunca presumido como exato. Site oficial: https://viacep.com.br/
4. **BrasilAPI:** fallback somente se a primeira API estiver indisponível ou der erro transitório; não substituir a mensagem 'CEP inexistente' por outro endereço. As coordenadas CEP v2 podem ser aproximadas. Docs: https://brasilapi.com.br/docs
5. **IBGE:** carregar somente as cidades de uma UF escolhida. O retorno leva código oficial de município e cache de 24 horas. Docs: https://servicodados.ibge.gov.br/api/docs/localidades

### Segurança e privacidade

- Nunca incorporar tokens/segredos de API no React ou expor credenciais no repositório.
- Entradas são validadas antes de acessar os provedores; URLs externas são fixas no servidor, evitando proxy arbitrário/SSRF.
- Endereço completo e contatos pessoais não são expostos pelos endpoints de perfil público; a página de CEP não grava consultas.
- Não apresentar calorias/proteínas de fontes colaborativas como recomendação nutricional ou diagnóstico.
- Fontes podem mudar políticas, estrutura ou disponibilidade: revisar antes de apresentação/produção.

### Casos de demonstração sugeridos

- Acessar `/integracoes` e pesquisar código **3017620422003** (apenas exemplo; depende da disponibilidade do provedor).
- Procurar receita `chicken` ou clicar na receita aleatória; mostrar ingredientes e origem.
- Buscar `01001000` no CEP e apresentar a identificação ViaCEP/BrasilAPI, conforme o retorno real.
- Selecionar o estado **CE** e apresentar a lista de municípios do IBGE.
- Abrir `/api/docs` para mostrar OpenAPI e endpoints documentados.

**Limitação de verificação:** os endpoints externos foram implementados conforme documentação oficial, mas ainda exigem teste de integração em máquina com acesso à internet e dependências npm instaladas.

## Cliente HTTP Axios e POO (revisão 10/11/2026)

`server/src/httpClient.js` implementa `ClienteHttp`, classe que faz consultas HTTP usando **Axios** em operação normal. `server/src/external.js` continua responsável por cache, normalização, tratamento de exceções e identificação dos cinco provedores. A dependência `axios` está em `server/package.json`, instalada com `cd server && npm install`. Para testes offline, `NF_HTTP_DRIVER=fetch` permite simulação determinística de respostas; produção usa Axios. Este projeto não envia requisições para URLs arbitrárias passadas pelo usuário.
