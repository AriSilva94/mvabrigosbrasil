-- ========================================
-- Migração: Criar índice único para slug (vagas)
-- ========================================
--
-- IMPORTANTE: Execute este arquivo APENAS após:
-- 1. add-slug-column.sql (adicionar coluna)
-- 2. migrate-vacancies-wp-to-supabase.js (migrar dados)
-- 3. check-slug-duplicates.js (verificar duplicatas)
--
-- Executar no Supabase SQL Editor
-- ========================================

-- Criar índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_vacancies_slug ON vacancies(slug);

-- Criar índice para wp_post_id (rastreamento de migração)
CREATE INDEX IF NOT EXISTS idx_vacancies_wp_post_id ON vacancies(wp_post_id);

-- Comentários nos índices
COMMENT ON INDEX idx_vacancies_slug IS 'Unique index for vacancy slugs. Ensures fast lookups and prevents duplicates.';
COMMENT ON INDEX idx_vacancies_wp_post_id IS 'Index for tracking WordPress post ID during migration.';

-- ========================================
-- VERIFICAÇÃO
-- ========================================
--
-- Após criar os índices, execute esta query para verificar:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'vacancies'
--   AND indexname IN ('idx_vacancies_slug', 'idx_vacancies_wp_post_id');
--
-- Deve retornar 2 linhas confirmando a criação dos índices.
