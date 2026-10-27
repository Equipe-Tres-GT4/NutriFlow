# NutriFlow — Nova tela de cadastro

Este pacote foi preparado a partir da branch `origin/develop` incluída no ZIP enviado.

## Arquivos alterados

- `src/pages/Cadastro.jsx` — layout React/Bootstrap, campos, preferências, verificações e navegação
- `src/pages/Cadastro.css` — estilos responsivos exclusivos do cadastro
- `src/auth/AuthContext.jsx` — salva preferências, uniformiza os e-mails e mantém o fluxo de login
- `src/pages/Login.jsx` — informa quando a conta foi criada

## Como testar na sua cópia do projeto (Git Bash)

```bash
git status
git switch develop
git pull origin develop
git switch -c feat/melhoria-tela-cadastro
```

Copie as 4 pastas/arquivos do `NutriFlow_Cadastro_Arquivos.zip` para o projeto, mantendo os mesmos caminhos.
Em seguida:

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173/cadastro

Verificação antes de enviar o PR:

```bash
npm run build
npm run lint
```

## Testes manuais recomendados

1. Abra em tela grande e em celular; observe o layout responsivo.
2. Clique em “Criar minha conta” com tudo vazio para ver mensagens por campo.
3. Teste e-mails inválidos, senhas fracas e confirmação diferente.
4. Clique no ícone do olho para mostrar/ocultar senhas.
5. Selecione restrições (opcional), registre-se e confira a mensagem no login.
6. Tente cadastrar o mesmo e-mail novamente, inclusive com maiúsculas.
7. Faça login e verifique o objeto `sessao` no LocalStorage.

## Atenção sobre segurança

O projeto original usa `localStorage` e grava a senha sem hash. O pacote mantém esse fluxo
para compatibilidade com o protótipo, mas **não é adequado para uso com pessoas reais em produção**.
Antes de publicar, é necessário substituir o cadastro/login local por API e banco de dados,
com hash de senha no servidor, sessões seguras e cuidados com LGPD.

As preferências alimentares ficam salvas no perfil local (`preferencias`), mas **a aplicação
não aplica esses filtros automaticamente no catálogo**. Isso deve ser implementado em outra etapa.

## Nota sobre verificação

A sintaxe dos arquivos alterados foi validada com o parser TypeScript/JSX. Não foi possível
concluir `npm ci`, `npm run build` ou `npm run lint` neste ambiente por indisponibilidade
das dependências no registro/cache npm. Faça esses testes localmente antes do merge.
