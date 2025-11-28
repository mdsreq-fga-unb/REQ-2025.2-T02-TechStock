-- Tipos (ENUMs) para manter compatibilidade com os nomes solicitados
-- Ajuste os valores conforme regras do negócio.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_cliente' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_cliente AS ENUM ('PF', 'PJ', 'CONSUMIDOR', 'REVENDEDOR', 'MANUTENCAO');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_cliente' AND n.nspname = 'public'
  ) THEN
    BEGIN
      ALTER TYPE public.tipo_cliente ADD VALUE 'CONSUMIDOR';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE public.tipo_cliente ADD VALUE 'REVENDEDOR';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE public.tipo_cliente ADD VALUE 'MANUTENCAO';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'status_ordem_servico' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.status_ordem_servico AS ENUM ('EmAndamento', 'Concluido');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_evento_celular' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_evento_celular AS ENUM ('OrdemServicoCriada', 'OrdemServicoAtualizada', 'OrdemServicoConcluida', 'OrdemServicoPecaRegistrada');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_evento_celular' AND n.nspname = 'public'
  ) THEN
    BEGIN
      ALTER TYPE public.tipo_evento_celular ADD VALUE 'GarantiaRegistrada';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE public.tipo_evento_celular ADD VALUE 'GarantiaAlerta';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'garantia_origem' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.garantia_origem AS ENUM ('VENDA', 'ORDEM_SERVICO', 'MANUAL');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_garantia' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_garantia AS ENUM ('PRODUTO', 'SERVICO');
  END IF;
END $$;
