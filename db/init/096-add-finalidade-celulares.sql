DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'finalidade_celular' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.finalidade_celular AS ENUM ('REVENDA', 'MANUTENCAO');
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
    ALTER TYPE public.finalidade_celular ADD VALUE 'REVENDA';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE public.finalidade_celular ADD VALUE 'MANUTENCAO';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE celulares
  ADD COLUMN IF NOT EXISTS finalidade finalidade_celular NOT NULL DEFAULT 'REVENDA';

ALTER TABLE celulares
  ALTER COLUMN finalidade SET DEFAULT 'REVENDA';
