# Diagnóstico de conexão e contas — NutriFlow

Essa atualização não altera tabelas, contas ou senhas. Ela apenas melhora a identificação de erros de inicialização e adiciona o comando `npm run doctor`. **Faça backup de `server/data`, `server/uploads` e `server/.env` antes de aplicar atualizações.**

## Instalação

Extraia o ZIP menor em `~/Documentos/`, mesclando `NutriFlow-main`, sem substituir `.env`, SQLite ou uploads. Não é necessária migration nova.

## Diagnóstico

No Git Bash, dentro de `~/Documentos/NutriFlow-main`:

```bash
npm run doctor
```

O comando mostra o caminho exato do banco aberto, quantidade de usuários reais, DEMO e admin, migrations aplicadas e valida se cada uma das cinco senhas no arquivo administrativo local corresponde ao hash gravado no banco (sem imprimir senhas). Não cadastra ninguém e pode ser executado com o backend desligado.

## Se o servidor não responde

Em um terminal (backend):

```bash
cd ~/Documentos/NutriFlow-main/server
npm run dev
```

Se a porta 3001 estiver ocupada, encerre a instância antiga; não apague o banco. Em outro terminal, rode o Vite na pasta principal:

```bash
cd ~/Documentos/NutriFlow-main
npm run dev
```

Teste `http://127.0.0.1:3001/api/health` e `http://localhost:5173`. A configuração do proxy do Vite passa a usar IPv4 explícito (127.0.0.1), evitando inconsistências de resolução de `localhost` em alguns ambientes Windows. Isso não substitui a necessidade de manter o backend em execução.

## Administradores

O arquivo `server/.admin-seed.local.json` deve existir no seu computador, **não deve ser enviado ao GitHub** e não vem dentro do ZIP. Sua estrutura é uma lista de cinco objetos com `nome`, `email`, `senha`.

Com o backend parado, se estiverem ausentes, execute:

```bash
cd ~/Documentos/NutriFlow-main/server
npm run db:migrate
npm run db:seed:admins
npm run doctor
```

O seed preserva senhas de contas admin que já existem. Caso o diagnóstico informe `DIVERGENTE`, o login correto é com a senha cadastrada originalmente; **não apague usuários para tentar resolver**. Uma recuperação administrativa segura deve ser feita em procedimento separado, com backup e confirmação da identidade.

Os cinco perfis marcados `DEMO` usados para preencher receitas possuem senhas aleatórias e não são contas de login.

## Outros cuidados

`ECONNRESET` seguido de `ECONNREFUSED` pode indicar que o backend foi encerrado ou reiniciou. Se persistir, copie o erro mostrado no **terminal do backend**, não apenas no terminal Vite. Nunca envie seu `.env` com JWT_SECRET, nem seu JSON com senhas.
