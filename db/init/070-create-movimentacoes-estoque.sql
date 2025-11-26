CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id SERIAL PRIMARY KEY,
  tipo_item TEXT NOT NULL,
  tipo_operacao TEXT NOT NULL,
  celular_id INT REFERENCES celulares(id) ON DELETE SET NULL,
  peca_id INT REFERENCES pecas(id) ON DELETE SET NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  saldo_resultante INT,
  observacoes TEXT,
  data_movimentacao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT movimentacoes_item_check CHECK (
    (celular_id IS NOT NULL AND peca_id IS NULL)
    OR (celular_id IS NULL AND peca_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS movimentacoes_tipo_item_idx ON movimentacoes_estoque(tipo_item);
CREATE INDEX IF NOT EXISTS movimentacoes_tipo_operacao_idx ON movimentacoes_estoque(tipo_operacao);
CREATE INDEX IF NOT EXISTS movimentacoes_usuario_idx ON movimentacoes_estoque(usuario_id);
CREATE INDEX IF NOT EXISTS movimentacoes_data_idx ON movimentacoes_estoque(data_movimentacao);
