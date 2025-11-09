CREATE TABLE IF NOT EXISTS pecas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  codigo_interno VARCHAR(255) UNIQUE NOT NULL,
  compatibilidade TEXT,
  quantidade INT NOT NULL DEFAULT 0,
  garantia_padrao_dias INT NOT NULL DEFAULT 90,
  data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  nome_fornecedor VARCHAR(255) NOT NULL,
  usuario_cadastro_id INT REFERENCES usuarios(id),
  created_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para manter updated_at em updates
DROP TRIGGER IF EXISTS pecas_set_updated_at ON pecas;
CREATE TRIGGER pecas_set_updated_at
BEFORE UPDATE ON pecas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
