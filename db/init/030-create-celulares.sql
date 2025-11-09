CREATE TABLE IF NOT EXISTS celulares (
  id SERIAL PRIMARY KEY,
  modelo VARCHAR(255) NOT NULL,
  imei VARCHAR(255) UNIQUE NOT NULL,
  cor VARCHAR(255),
  capacidade VARCHAR(255),
  valor_compra NUMERIC(10, 2),
  garantia_padrao_dias INT NOT NULL DEFAULT 365,
  defeitos_identificados TEXT,
  tipo tipo_estoque_celular NOT NULL,
  status status_celular NOT NULL DEFAULT 'EmEstoque',
  data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  nome_fornecedor VARCHAR(255) NOT NULL,
  usuario_cadastro_id INT REFERENCES usuarios(id),
  created_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para manter updated_at em updates
DROP TRIGGER IF EXISTS celulares_set_updated_at ON celulares;
CREATE TRIGGER celulares_set_updated_at
BEFORE UPDATE ON celulares
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
