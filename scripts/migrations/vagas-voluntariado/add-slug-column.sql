-- ========================================
-- Migração: Adicionar coluna slug na tabela vacancies
-- ========================================
--
-- Objetivo: Adicionar campo slug para permitir URLs amigáveis
-- e eliminar necessidade de geração dinâmica de slug em memória
--
-- Executar no Supabase SQL Editor
-- ========================================

-- 1. Adicionar coluna slug (nullable inicialmente)
ALTER TABLE vacancies
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Adicionar coluna wp_post_id para rastreamento de migração
ALTER TABLE vacancies
ADD COLUMN IF NOT EXISTS wp_post_id INTEGER;

-- 3. Comentários nas colunas
COMMENT ON COLUMN vacancies.slug IS 'URL-friendly identifier for vacancy. Generated from title or migrated from wp_posts_raw.post_name';
COMMENT ON COLUMN vacancies.wp_post_id IS 'Reference to original WordPress post ID for migration tracking';

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
--
-- NÃO criar índice UNIQUE ainda porque:
-- 1. Precisa popular os dados primeiro (via script backfill-slug.js)
-- 2. Precisa garantir que não há duplicatas
--
-- Após rodar o script de backfill, execute:
--   CREATE UNIQUE INDEX IF NOT EXISTS idx_vacancies_slug ON vacancies(slug);
--
-- Ordem de execução:
-- 1. Este arquivo (add-slug-column.sql)
-- 2. migrate-vacancies-wp-to-supabase.js (migrar dados)
-- 3. backfill-slug.js (popular slugs se necessário)
-- 4. check-slug-duplicates.js (verificar duplicatas)
-- 5. create-slug-index.sql (criar índice único)
