-- Adicionar coluna numero_serie se não existir
ALTER TABLE termos ADD COLUMN IF NOT EXISTS numeroSerie VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna patrimonio se não existir
ALTER TABLE termos ADD COLUMN IF NOT EXISTS patrimonio VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna responsavelId se não existir
ALTER TABLE termos ADD COLUMN IF NOT EXISTS responsavelId VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna equipe se não existir
ALTER TABLE termos ADD COLUMN IF NOT EXISTS equipe VARCHAR(255) DEFAULT NULL;

-- Adicionar coluna data se não existir
ALTER TABLE termos ADD COLUMN IF NOT EXISTS data VARCHAR(255) DEFAULT NULL;

-- Índices para melhorar performance de consultas (opcional)
CREATE INDEX IF NOT EXISTS idx_termos_numero_serie ON termos(numeroSerie);
CREATE INDEX IF NOT EXISTS idx_termos_patrimonio ON termos(patrimonio);
CREATE INDEX IF NOT EXISTS idx_termos_responsavel_id ON termos(responsavelId); 