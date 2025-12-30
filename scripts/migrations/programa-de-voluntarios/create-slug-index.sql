-- ========================================
-- Migração: Criar índice único para slug
-- ========================================
--
-- IMPORTANTE: Execute este arquivo APENAS após:
-- 1. add-slug-column.sql (adicionar coluna)
-- 2. backfill-slug.js (popular dados)
-- 3. check-slug-duplicates.js (verificar duplicatas)
--
-- Executar no Supabase SQL Editor
-- ========================================

-- Criar índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_slug ON volunteers(slug);

-- Comentário no índice
COMMENT ON INDEX idx_volunteers_slug IS 'Unique index for volunteer slugs. Ensures fast lookups and prevents duplicates.';

-- ========================================
-- VERIFICAÇÃO
-- ========================================
--
-- Após criar o índice, execute esta query para verificar:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'volunteers'
--   AND indexname = 'idx_volunteers_slug';
--
-- Deve retornar 1 linha confirmando a criação do índice.
