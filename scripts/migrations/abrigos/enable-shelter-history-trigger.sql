-- ========================================
-- Migração: Reabilitar Trigger de Histórico
-- ========================================
--
-- Descrição:
--   Reabilita o trigger de histórico da tabela shelters
--   após concluir a migração.
--
-- Uso:
--   Execute este script no SQL Editor do Supabase
--   APÓS concluir a migração
--
-- Data: 2025-12-29
-- ========================================

-- Reabilitar trigger de histórico
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  -- Buscar todos os triggers da tabela shelters (exceto triggers internos)
  FOR trigger_rec IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public.shelters'::regclass
      AND tgname NOT LIKE 'RI_%'
      AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE public.shelters ENABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE 'Trigger % reabilitado', trigger_rec.tgname;
  END LOOP;
END $$;

-- Verificar se triggers foram reabilitados
SELECT
  tgname AS trigger_name,
  tgenabled AS enabled,
  CASE
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'Disabled'
    WHEN tgenabled = 'R' THEN 'Replica'
    WHEN tgenabled = 'A' THEN 'Always'
    ELSE 'Unknown'
  END AS status
FROM pg_trigger
WHERE tgrelid = 'public.shelters'::regclass
  AND tgname NOT LIKE 'RI_%';

-- ========================================
-- Resultado Esperado:
-- ========================================
-- Todos os triggers devem mostrar status = 'Enabled' (O)
-- ========================================
