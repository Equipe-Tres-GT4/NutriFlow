-- Executar no MySQL Shell em modo SQL ou MySQL Workbench com conta administradora.
CREATE DATABASE IF NOT EXISTS nutriflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'nutriflow'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON nutriflow_db.* TO 'nutriflow'@'localhost';
-- No Windows, 127.0.0.1 normalmente funciona com a conta localhost.
-- Se o servidor exigir outra origem, ajuste usuário/host no MySQL e no .env.
