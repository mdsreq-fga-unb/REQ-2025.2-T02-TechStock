CREATE TABLE IF NOT EXISTS ordens_servico_testes (
  id SERIAL PRIMARY KEY,
  ordem_servico_id INT NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  criterios TEXT NOT NULL DEFAULT '{}',
  observacoes TEXT,
  aprovado BOOLEAN NOT NULL DEFAULT FALSE,
  resultado VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
  midia_urls TEXT,
  etapa VARCHAR(50) NOT NULL DEFAULT 'INICIAL',
  executado_por INT REFERENCES usuarios(id) ON DELETE SET NULL,
  data_execucao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ordens_servico_testes_ordem_idx ON ordens_servico_testes(ordem_servico_id);
CREATE INDEX IF NOT EXISTS ordens_servico_testes_executor_idx ON ordens_servico_testes(executado_por);

DROP TRIGGER IF EXISTS ordens_servico_testes_set_updated_at ON ordens_servico_testes;
CREATE TRIGGER ordens_servico_testes_set_updated_at
BEFORE UPDATE ON ordens_servico_testes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
