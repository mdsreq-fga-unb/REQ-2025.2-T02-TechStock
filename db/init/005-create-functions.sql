-- Funções utilitárias globais para triggers

-- Função para atualizar o campo updated_at em triggers BEFORE UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
