-- =====================================================
-- SCRIPT 06: Reabilitar Triggers PÓS-MIGRAÇÃO
-- =====================================================
--
-- Descrição:
--   Reabilita o trigger de histórico após concluir
--   a migração de dados do WordPress.
--
-- Quando executar:
--   APÓS concluir TODOS os scripts de migração JS e
--   APÓS criar os índices únicos de slug
--
-- =====================================================

-- =====================================================
-- 1. Reabilitar trigger de histórico
-- =====================================================

DO $$
DECLARE
  trigger_rec RECORD;
  enabled_count INTEGER := 0;
BEGIN
  -- Buscar todos os triggers desabilitados da tabela shelters
  FOR trigger_rec IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public.shelters'::regclass
      AND tgname NOT LIKE 'RI_%'
      AND tgname NOT LIKE 'pg_%'
      AND tgenabled = 'D' -- Apenas os desabilitados
  LOOP
    EXECUTE format('ALTER TABLE public.shelters ENABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE '✅ Trigger % reabilitado', trigger_rec.tgname;
    enabled_count := enabled_count + 1;
  END LOOP;

  IF enabled_count = 0 THEN
    RAISE NOTICE '⚠️  Nenhum trigger desabilitado encontrado. Já foram reabilitados?';
  ELSE
    RAISE NOTICE '✅ Total de triggers reabilitados: %', enabled_count;
  END IF;
END $$;

-- =====================================================
-- 2. Verificar se triggers foram reabilitados
-- =====================================================

SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled (CORRETO!)'
    WHEN 'D' THEN '🔴 Disabled (ERRO!)'
    WHEN 'R' THEN '🔄 Replica'
    WHEN 'A' THEN '⚡ Always'
    ELSE '❓ Unknown'
  END AS status
FROM pg_trigger
WHERE tgrelid = 'public.shelters'::regclass
  AND tgname NOT LIKE 'RI_%'
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- TODOS os triggers devem mostrar status = '✅ Enabled'
--
-- trigger_shelter_history | shelters | ✅ Enabled
-- trigger_set_timestamp_shelters | shelters | ✅ Enabled
--
-- =====================================================
-- PRÓXIMO PASSO:
-- =====================================================
-- Execute o script 07 para validar que a migração foi
-- concluída com sucesso!
-- =====================================================
