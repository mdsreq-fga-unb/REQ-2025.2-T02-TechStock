CREATE TABLE IF NOT EXISTS vendas (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  celular_id INT NOT NULL REFERENCES celulares(id) ON DELETE RESTRICT,
  data_venda TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  valor_venda NUMERIC(10, 2),
  garantia_dias INT,
  garantia_validade TIMESTAMPTZ,
  observacoes TEXT,
  created_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS vendas_set_updated_at ON vendas;
CREATE TRIGGER vendas_set_updated_at
BEFORE UPDATE ON vendas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS vendas_cliente_idx ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS vendas_celular_idx ON vendas(celular_id);
