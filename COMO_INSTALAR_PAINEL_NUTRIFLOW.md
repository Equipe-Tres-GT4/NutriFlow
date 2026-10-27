# NutriFlow — Nova área após o login

## O que foi entregue

Uma interface responsiva em React + Bootstrap 5, integrada à versão `develop` enviada neste chat: painel com hero e indicadores, pesquisa de alimentos, busca e filtros de receitas, favoritos, detalhes com ingredientes e passos, curtidas, comentários, publicação, exclusão de publicações próprias, edição de perfil e saída da conta.

Os recursos comunitários (publicações, curtidas, comentários e favoritos) ficam **somente no navegador deste usuário** para demonstração. Uma publicação não aparece em outros computadores porque o projeto ainda não tem backend de comunidade.

## Instalação mais simples (arquivos modificados)

1. Faça uma cópia de segurança ou commit das alterações atuais da equipe antes de substituir arquivos.
2. Descompacte `NutriFlow_Painel_Arquivos.zip` na **pasta raiz** do repositório NutriFlow (onde está `package.json`). Mantenha as pastas internas e permita substituir os arquivos com o mesmo nome.
3. No Git Bash, abra essa pasta e execute:

```bash
npm install
npm run dev
```

4. Acesse `http://localhost:5173/cadastro` para criar uma conta de teste, entre em `/login` e confira o painel em `http://localhost:5173/`.
5. Para verificar antes do merge:

```bash
npm run lint
npm run build
```

## Alternativa: projeto completo

`NutriFlow_Painel_Completo.zip` contém o projeto de referência inteiro e pode ser descompactado em uma pasta **separada** para testar sem interferir no repositório atual.

## Validação e limites

- Foram conferidos 29 arquivos JS/JSX (sintaxe), imports relativos, imagens e principais rotas. Todos passaram nessa análise estática.
- **O build Vite e o teste interativo no navegador não foram concluídos** neste ambiente porque a instalação de dependências não terminou. Rode os comandos acima localmente.
- Novos cadastros não armazenam a senha em texto puro; há derivação PBKDF2 com salt e sessão na aba. Contas antigas são migradas ao entrar, quando possível. Ainda assim, armazenamento/autorizações realizados no cliente **não são seguros para produção**.
- A autenticação segura e uma comunidade real exigem servidor, banco de dados e autorização no backend. O README do projeto traz um checklist antes de publicar.
- Etiquetas de restrição têm * e são **indicativas**; confira os rótulos, fontes e risco de contaminação cruzada.

## Rotas de teste

- `/` — painel do usuário
- `/alimentos` — pesquisa e restrições alimentares
- `/receitas` — receitas, filtros e busca
- `/receitas/:id` — detalhes, salvar, curtir, comentar
- `/salvos` — favoritos
- `/minhas-receitas` — minhas publicações
- `/publicar` — criar receita
- `/perfil` — editar perfil e preferências
- `/login` e `/cadastro` — autenticação de teste
