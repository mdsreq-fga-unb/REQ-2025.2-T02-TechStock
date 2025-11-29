CREATE TABLE IF NOT EXISTS public.garantias (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  celular_id INTEGER NOT NULL REFERENCES public.celulares(id) ON DELETE RESTRICT,
  origem_tipo garantia_origem NOT NULL DEFAULT 'MANUAL',
  origem_id INTEGER,
  tipo tipo_garantia NOT NULL DEFAULT 'SERVICO',
  prazo_dias INTEGER NOT NULL CHECK (prazo_dias > 0),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  alerta_enviado_em TIMESTAMPTZ,
  observacoes TEXT,
  created_by INTEGER DEFAULT 1,
  updated_by INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS garantia_origem_unique_idx
  ON public.garantias (origem_tipo, origem_id);

CREATE INDEX IF NOT EXISTS garantia_cliente_idx
  ON public.garantias (cliente_id);

CREATE INDEX IF NOT EXISTS garantia_celular_idx
  ON public.garantias (celular_id);

CREATE INDEX IF NOT EXISTS garantia_data_fim_idx
  ON public.garantias (data_fim);
