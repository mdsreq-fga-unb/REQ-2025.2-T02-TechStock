DO $$
BEGIN
  -- Adds the new historico event used when registrando testes técnicos.
  ALTER TYPE "tipo_evento_celular" ADD VALUE 'TesteTecnicoRegistrado';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;
