-- ========================================
-- Migração: Adicionar coluna wp_post_id à tabela shelters
-- ========================================
--
-- Descrição:
--   Adiciona a coluna wp_post_id para rastreabilidade dos dados
--   migrados do WordPress para a tabela shelters do Supabase.
--
-- Uso:
--   Execute este script no SQL Editor do Supabase
--
-- Data: 2025-12-29
-- ========================================

-- 1. Adicionar coluna wp_post_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'shelters'
      AND column_name = 'wp_post_id'
  ) THEN
    ALTER TABLE public.shelters
    ADD COLUMN wp_post_id INTEGER;

    -- Adicionar comentário explicativo
    COMMENT ON COLUMN public.shelters.wp_post_id IS
      'ID do post legado do WordPress (post_type=abrigo) - usado para rastreabilidade e migração idempotente';

    RAISE NOTICE 'Coluna wp_post_id adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna wp_post_id já existe, pulando...';
  END IF;
END $$;

-- 2. Adicionar constraint UNIQUE se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shelters_wp_post_id_key'
  ) THEN
    ALTER TABLE public.shelters
    ADD CONSTRAINT shelters_wp_post_id_key UNIQUE (wp_post_id);

    RAISE NOTICE 'Constraint UNIQUE adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Constraint UNIQUE já existe, pulando...';
  END IF;
END $$;

-- 3. Criar índice para performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_shelters_wp_post_id
ON public.shelters(wp_post_id)
WHERE wp_post_id IS NOT NULL;

-- 4. Verificar estrutura final
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'shelters'
  AND column_name = 'wp_post_id';

-- 5. Verificar constraint
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.shelters'::regclass
  AND conname = 'shelters_wp_post_id_key';

-- 6. Verificar índice
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'shelters'
  AND indexname = 'idx_shelters_wp_post_id';

-- ========================================
-- Resultado Esperado:
-- ========================================
-- ✅ Coluna wp_post_id: INTEGER, NULL permitido
-- ✅ Constraint: UNIQUE (wp_post_id)
-- ✅ Índice: idx_shelters_wp_post_id (parcial, apenas NOT NULL)
-- ========================================
