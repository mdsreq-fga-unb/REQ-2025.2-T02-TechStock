-- Tipos (ENUMs) para manter compatibilidade com os nomes solicitados
-- Ajuste os valores conforme regras do negócio.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_cliente' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_cliente AS ENUM ('PF', 'PJ');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_estoque_celular' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_estoque_celular AS ENUM ('Novo', 'Usado', 'Recondicionado');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'status_celular' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.status_celular AS ENUM ('EmEstoque', 'Vendido', 'EmReparo', 'Descartado');
  END IF;
END $$;
