# NutriFlow — área autenticada (versão de teste)

Projeto React + Vite + Bootstrap 5. Este pacote integra a tela de cadastro atualizada e uma área de usuário completa e responsiva.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/cadastro`, crie uma conta e faça login. Depois do login, você acessará o dashboard em `/`.

Para conferir possíveis erros de desenvolvimento:

```bash
npm run lint
npm run build
```

## Rotas

| Rota | Conteúdo | Acesso |
|---|---|---|
| `/cadastro` | Criar conta | Público |
| `/login` | Entrar | Público |
| `/catalogo` | Catálogo antigo | Público |
| `/` | Dashboard pós-login | Login |
| `/alimentos` | Pesquisa de alimentos e alergênicos | Login |
| `/receitas` | Busca, filtros e receitas da comunidade | Login |
| `/receitas/:id` | Detalhes, ingredientes, preparo, curtidas e comentários | Login |
| `/salvos` | Receitas favoritas | Login |
| `/minhas-receitas` | Receitas criadas e exclusão | Login |
| `/publicar` | Publicação com validação e aviso de segurança alimentar | Login |
| `/perfil` | Editar nome e preferências | Login |

## Dados de demonstração

Receitas, favoritos, comentários e preferências do painel persistem **apenas neste navegador**, sem sincronização entre usuários, aparelhos ou servidores. As publicações da comunidade são uma **simulação local**; por isso, não existe moderação nem publicação pública real.

## Segurança: o que está implementado e o que falta

### Já implementado neste protótipo
- React renderiza conteúdo do usuário como texto, sem `dangerouslySetInnerHTML`.
- Validação de formulários e limites de tamanho de entradas.
- Restrição de rotas pelo estado de autenticação do aplicativo (proteção **de interface**, não de servidor).
- Cada conta local tem seu conjunto de favoritos e publicações.
- Senhas novas são derivadas com PBKDF2-SHA-256 (210.000 iterações + salt aleatório) antes de irem ao armazenamento local; senhas de usuários antigos são migradas no próximo login.
- Sessão do protótipo agora é guardada em `sessionStorage` e encerrada ao fazer logout.
- Filtros tratam alimentos não confirmados de modo conservador, com avisos sobre alergênicos e contaminação cruzada.

### Obrigatório antes de publicar para usuários reais
1. Backend seguro com banco de dados e autenticação feita **exclusivamente no servidor**; não confiar em `localStorage`, `sessionStorage`, rotas ou dados de frontend para autorizações.
2. Senhas derivadas no servidor com Argon2id (ou alternativa atual equivalente), proteção contra força bruta, confirmação de e-mail, recuperação de senha e sessões usando cookies `HttpOnly`, `Secure`, `SameSite` sob HTTPS.
3. Controle de autorização por proprietário para criar/editar/excluir receitas e comentários, no backend.
4. Validação no servidor, sanitização adequada do conteúdo, política de links/imagens, anti-spam, moderação e limites por usuário.
5. Ajustar política de privacidade e tratamento de dados (LGPD), especialmente preferências alimentares; coletar somente o necessário.
6. Validar fontes e informações sobre alergênicos antes de rotular um alimento ou receita como adequado a restrições. Os selos atuais são indicativos, nunca certificações.
7. Testes de ponta a ponta com conta real e auditoria de segurança antes de produção.

**Não use o protótipo atual para armazenar senhas reais ou dados sensíveis.** A criptografia local melhora a demonstração, mas não garante autenticação nem controle de acesso seguros contra alguém que altera o navegador.

## Como integrar na branch develop

Em uma cópia limpa da branch `develop`, copie o conteúdo de `src` do pacote sobre os arquivos correspondentes. Faça commit apenas depois de revisar `git diff` e executar os testes. O ZIP completo mantém a estrutura do projeto; não inclui `node_modules` nem `.git`.
