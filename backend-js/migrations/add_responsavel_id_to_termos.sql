-- Adiciona a coluna responsavel_id à tabela termos
ALTER TABLE termos
ADD COLUMN responsavel_id INTEGER,
ADD CONSTRAINT fk_responsavel
    FOREIGN KEY (responsavel_id)
    REFERENCES users(id)
    ON DELETE SET NULL; 