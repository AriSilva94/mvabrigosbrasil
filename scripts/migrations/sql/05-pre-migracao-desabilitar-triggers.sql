-- =====================================================
-- SCRIPT 05: Desabilitar Triggers PRÉ-MIGRAÇÃO
-- =====================================================
--
-- Descrição:
--   Desabilita temporariamente o trigger de histórico
--   para evitar problemas durante a migração, já que
--   registros migrados não têm profile_id inicialmente.
--
-- Quando executar:
--   IMEDIATAMENTE ANTES de rodar os scripts de migração JS
--
-- IMPORTANTE:
--   Após concluir a migração, execute o script 06 para
--   REABILITAR os triggers!
--
-- =====================================================

-- =====================================================
-- 1. Listar triggers atuais
-- =====================================================

SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '🔴 Disabled'
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
-- 2. Desabilitar trigger de histórico em shelters
-- =====================================================

DO $$
DECLARE
  trigger_rec RECORD;
  disabled_count INTEGER := 0;
BEGIN
  -- Buscar todos os triggers da tabela shelters (exceto triggers internos)
  FOR trigger_rec IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public.shelters'::regclass
      AND tgname NOT LIKE 'RI_%'
      AND tgname NOT LIKE 'pg_%'
      AND tgname = 'trigger_shelter_history' -- Apenas o trigger de histórico
  LOOP
    EXECUTE format('ALTER TABLE public.shelters DISABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE '🔴 Trigger % desabilitado', trigger_rec.tgname;
    disabled_count := disabled_count + 1;
  END LOOP;

  IF disabled_count = 0 THEN
    RAISE NOTICE '⚠️  Nenhum trigger de histórico encontrado. Verifique se foi criado corretamente.';
  ELSE
    RAISE NOTICE '✅ Total de triggers desabilitados: %', disabled_count;
  END IF;
END $$;

-- =====================================================
-- 3. Verificar se trigger foi desabilitado
-- =====================================================

SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '🔴 Disabled (CORRETO para migração!)'
    WHEN 'R' THEN '🔄 Replica'
    WHEN 'A' THEN '⚡ Always'
    ELSE '❓ Unknown'
  END AS status,
  'OK para migração' AS ready_for_migration
FROM pg_trigger
WHERE tgrelid = 'public.shelters'::regclass
  AND tgname NOT LIKE 'RI_%'
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- trigger_shelter_history | shelters | 🔴 Disabled
-- trigger_set_timestamp_shelters | shelters | ✅ Enabled (pode ficar)
--
-- Se o trigger de histórico está Disabled, você pode
-- prosseguir com a migração!
--
-- =====================================================
-- PRÓXIMO PASSO:
-- =====================================================
-- Agora me avise que executou este script e eu vou
-- iniciar a execução dos scripts JS de migração:
--
-- 1. Migração de abrigos (shelters)
-- 2. Migração de voluntários (volunteers)
-- 3. Backfill de slugs (volunteers)
-- 4. Migração de vagas (vacancies)
--
-- =====================================================
