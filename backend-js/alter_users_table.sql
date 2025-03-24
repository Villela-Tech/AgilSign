-- SQL para transferir dados das colunas duplicadas e então removê-las

-- Copiar os valores das colunas CamelCase para as colunas snake_case
UPDATE users SET created_at = createdAt WHERE created_at IS NULL;
UPDATE users SET updated_at = updatedAt WHERE updated_at IS NULL;

-- Remover as colunas duplicadas
ALTER TABLE users DROP COLUMN createdAt;
ALTER TABLE users DROP COLUMN updatedAt;

-- Garantir que as colunas created_at e updated_at existam com os valores padrão corretos
ALTER TABLE users MODIFY created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users MODIFY updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP; 