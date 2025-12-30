-- ========================================
-- Migração: Desabilitar Trigger de Histórico Temporariamente
-- ========================================
--
-- Descrição:
--   Desabilita o trigger de histórico da tabela shelters
--   durante a migração, pois não temos profile_id para
--   os registros migrados do WordPress.
--
-- IMPORTANTE: Execute o enable-shelter-history-trigger.sql
--             após concluir a migração!
--
-- Uso:
--   Execute este script no SQL Editor do Supabase
--   ANTES de rodar a migração
--
-- Data: 2025-12-29
-- ========================================

-- Listar triggers existentes na tabela shelters
SELECT
  tgname AS trigger_name,
  tgenabled AS enabled
FROM pg_trigger
WHERE tgrelid = 'public.shelters'::regclass
  AND tgname NOT LIKE 'RI_%'; -- Excluir triggers de foreign key

-- Desabilitar trigger de histórico (se existir)
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
    EXECUTE format('ALTER TABLE public.shelters DISABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE 'Trigger % desabilitado', trigger_rec.tgname;
  END LOOP;
END $$;

-- Verificar se triggers foram desabilitados
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
-- Todos os triggers devem mostrar status = 'Disabled' (D)
-- ========================================
