-- Tabela mínima para suportar FKs referenciadas
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed opcional para testes
INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('Admin', 'admin@example.com', '$2a$10$seedhashplaceholder')
ON CONFLICT (email) DO NOTHING;
