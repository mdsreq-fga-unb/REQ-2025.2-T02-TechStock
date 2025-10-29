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
  usuario_cadastro_id INT REFERENCES usuarios(id)
);
