# NutriFlow — navegação enxuta e localização resiliente

## Mudanças visíveis

- A **Comunidade** passou a ser a entrada principal inclusive para visitantes: `/` redireciona para `/comunidade`.
- O menu principal contém Comunidade e Receitas, além de Conexões, Meus salvos, Meu perfil e Sair para usuários autenticados.
- Os links **Início** e **Alimentos** foram retirados do menu. Endereços antigos `/alimentos` e `/integracoes` continuam válidos como redirecionamentos para `/receitas`; não se perderá um favorito antigo do navegador.
- A pesquisa por produtos da Open Food Facts foi preservada dentro do **cadastro de receitas** como busca de ingredientes. O backend de alimentos permanece, pois essa integração ainda é utilizada. A seção **Meus salvos** foi simplificada para receitas; alimentos anteriormente salvos continuam no banco, sem exclusão de dados.

## Corrigindo o campo de estados

A versão anterior tentava consultar o IBGE no carregamento e ignorava o erro, deixando o select vazio. A atualização resolve isso em duas camadas:

1. `GET /api/integrations/location/states`: consulta o IBGE; se ele estiver indisponível ou devolver um formato inválido, retorna uma lista local das **27 UFs oficiais** com os códigos correspondentes. Uma falha temporária é lembrada por cinco minutos para que o usuário não espere indefinidamente.
2. Cadastro e Perfil compartilham o hook `src/hooks/useLocalidades.js`; ambos exibem carregamento, aviso de modo reserva e botão para tentar novamente quando o backend está inacessível. Se o CEP preencher a UF, a opção correspondente aparece selecionada.
3. `GET /api/integrations/location/states/:uf/cities`: tenta consultar municípios no IBGE. Se indisponível, o campo **Cidade continua editável** e mostra que é possível preencher manualmente (não inventamos uma lista parcial de municípios).

Os dados da lista de reserva são apenas nomes e códigos de UFs, não dados privados de usuários.

## Testes recomendados

1. Com frontend e backend rodando, abra `/cadastro` e confira as 27 UFs. Selecione Ceará e confira a consulta de municípios.
2. Consulte um CEP válido no cadastro ou no perfil: a UF deve ser selecionada automaticamente.
3. Se o IBGE estiver fora do ar, os estados ainda devem aparecer; municípios podem ser digitados manualmente.
4. Abra `/`, `/alimentos` e `/integracoes`: os destinos devem ser Comunidade, Receitas e Receitas, respectivamente.
5. Execute `npm run test:all` na raiz e `npm run build` após instalar as dependências.

## Atualização segura

Esta versão não exige nenhuma migration e não modifica nem apaga tabelas ou usuários. Ao instalar a atualização, faça backup de `server/.env`, `server/data` e `server/uploads` antes de substituir arquivos. Não substitua essas pastas ao extrair o ZIP.
