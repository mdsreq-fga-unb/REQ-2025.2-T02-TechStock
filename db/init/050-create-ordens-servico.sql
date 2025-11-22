CREATE TABLE IF NOT EXISTS ordens_servico (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  celular_id INT NOT NULL REFERENCES celulares(id) ON DELETE RESTRICT,
  descricao TEXT,
  status status_ordem_servico NOT NULL DEFAULT 'EmAndamento',
  data_abertura TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMPTZ,
  garantia_dias INT,
  garantia_validade TIMESTAMPTZ,
  observacoes TEXT,
  created_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_by INT DEFAULT 1 REFERENCES usuarios(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS ordens_servico_set_updated_at ON ordens_servico;
CREATE TRIGGER ordens_servico_set_updated_at
BEFORE UPDATE ON ordens_servico
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS celulares_historico (
  id SERIAL PRIMARY KEY,
  celular_id INT NOT NULL REFERENCES celulares(id) ON DELETE CASCADE,
  ordem_servico_id INT REFERENCES ordens_servico(id) ON DELETE SET NULL,
  tipo_evento tipo_evento_celular NOT NULL,
  descricao TEXT NOT NULL,
  data_evento TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS celulares_historico_celular_idx ON celulares_historico(celular_id);
CREATE INDEX IF NOT EXISTS celulares_historico_ordem_idx ON celulares_historico(ordem_servico_id);

CREATE TABLE IF NOT EXISTS ordens_servico_pecas (
  id SERIAL PRIMARY KEY,
  ordem_servico_id INT NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  peca_id INT NOT NULL REFERENCES pecas(id) ON DELETE RESTRICT,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  data_uso TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (ordem_servico_id, peca_id)
);

CREATE INDEX IF NOT EXISTS ordens_servico_pecas_ordem_idx ON ordens_servico_pecas(ordem_servico_id);
CREATE INDEX IF NOT EXISTS ordens_servico_pecas_peca_idx ON ordens_servico_pecas(peca_id);

