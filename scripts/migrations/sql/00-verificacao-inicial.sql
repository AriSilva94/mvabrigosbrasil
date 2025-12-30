-- =====================================================
-- SCRIPT 00: Verificação Inicial do Ambiente
-- =====================================================
--
-- Descrição:
--   Execute este script PRIMEIRO para verificar se o
--   ambiente está pronto para a migração.
--
-- Quando executar:
--   Logo após criar o projeto Supabase
--
-- Resultado esperado:
--   Deve mostrar versão do PostgreSQL e confirmar que
--   está vazio (sem tabelas de domínio ainda)
--
-- =====================================================

-- 1. Verificar versão do PostgreSQL
SELECT version();

-- 2. Verificar se extensões necessárias estão instaladas
SELECT
  extname AS extension_name,
  extversion AS version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')
ORDER BY extname;

-- 3. Verificar schemas existentes
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- 4. Verificar se tabelas de domínio já existem (NÃO devem existir ainda)
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'shelters',
    'volunteers',
    'vacancies',
    'shelter_dynamics',
    'shelter_volunteers',
    'shelter_history'
  )
ORDER BY table_name;

-- 5. Verificar se tabelas legadas existem (podem não existir ainda)
SELECT
  table_schema,
  table_name,
  CASE
    WHEN table_name LIKE '%_raw' THEN '🔴 Backup WordPress'
    WHEN table_name = 'wp_users_legacy' THEN '🔴 Backup WordPress'
    ELSE 'Outro'
  END AS tipo
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name LIKE 'wp_%_raw'
    OR table_name = 'wp_users_legacy'
  )
ORDER BY table_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
--
-- 1. PostgreSQL 15.x
-- 2. Extensões: uuid-ossp, pgcrypto instaladas
-- 3. Schemas: public, auth, storage (mínimo)
-- 4. Tabelas de domínio: ZERO (lista vazia)
-- 5. Tabelas legadas: ZERO (ou já importadas se você fez antes)
--
-- Se tudo OK, prossiga para o próximo script!
-- =====================================================
