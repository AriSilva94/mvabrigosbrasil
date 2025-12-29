-- ========================================
-- Migração: Adicionar coluna slug na tabela volunteers
-- ========================================
--
-- Objetivo: Adicionar campo slug para permitir URLs amigáveis
-- e eliminar necessidade de geração dinâmica de slug em memória
--
-- Executar no Supabase SQL Editor
-- ========================================

-- 1. Adicionar coluna slug (nullable inicialmente)
ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Comentário na coluna
COMMENT ON COLUMN volunteers.slug IS 'URL-friendly identifier for volunteer profile. Generated from name or migrated from wp_posts_raw.post_name';

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
--
-- NÃO criar índice UNIQUE ainda porque:
-- 1. Precisa popular os dados primeiro (via script backfill-slug.js)
-- 2. Precisa garantir que não há duplicatas
--
-- Após rodar o script de backfill, execute:
--   CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_slug ON volunteers(slug);
--
-- Ordem de execução:
-- 1. Este arquivo (add-slug-column.sql)
-- 2. backfill-slug.js (popula slugs)
-- 3. create-slug-index.sql (cria índice único)
