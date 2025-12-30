-- ========================================
-- FIX: Adicionar apenas a coluna slug que faltou
-- ========================================

-- Adicionar coluna slug (a coluna wp_post_id já existe)
ALTER TABLE vacancies ADD COLUMN slug TEXT;

-- Comentário
COMMENT ON COLUMN vacancies.slug IS 'URL-friendly identifier for vacancy';

-- Forçar reload do schema
NOTIFY pgrst, 'reload schema';

-- Verificar
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vacancies'
  AND column_name IN ('slug', 'wp_post_id')
ORDER BY column_name;
