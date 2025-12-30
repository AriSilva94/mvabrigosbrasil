-- =====================================================
-- SCRIPT 07: Validação Final da Migração
-- =====================================================
--
-- Descrição:
--   Valida que todos os dados foram migrados corretamente
--   e que a estrutura do banco está íntegra.
--
-- Quando executar:
--   APÓS concluir toda a migração e reabilitar triggers
--
-- =====================================================

-- =====================================================
-- 1. CONTAGENS: Comparar origem vs destino
-- =====================================================

SELECT '📊 CONTAGENS DE REGISTROS' AS secao;

-- Voluntários
SELECT
  'Voluntários' AS entidade,
  (SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'voluntario') AS origem_wordpress,
  (SELECT COUNT(*) FROM volunteers WHERE wp_post_id IS NOT NULL) AS destino_supabase,
  CASE
    WHEN (SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'voluntario') =
         (SELECT COUNT(*) FROM volunteers WHERE wp_post_id IS NOT NULL)
    THEN '✅ OK'
    ELSE '🔴 DIVERGÊNCIA!'
  END AS status;

-- Abrigos
SELECT
  'Abrigos' AS entidade,
  (SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'abrigo') AS origem_wordpress,
  (SELECT COUNT(*) FROM shelters WHERE wp_post_id IS NOT NULL) AS destino_supabase,
  CASE
    WHEN (SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'abrigo') =
         (SELECT COUNT(*) FROM shelters WHERE wp_post_id IS NOT NULL)
    THEN '✅ OK'
    ELSE '🔴 DIVERGÊNCIA!'
  END AS status;

-- Vagas
SELECT
  'Vagas' AS entidade,
  (SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'vaga') AS origem_wordpress,
  (SELECT COUNT(*) FROM vacancies WHERE wp_post_id IS NOT NULL) AS destino_supabase,
  CASE
    WHEN (SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'vaga') =
         (SELECT COUNT(*) FROM vacancies WHERE wp_post_id IS NOT NULL)
    THEN '✅ OK'
    ELSE '🔴 DIVERGÊNCIA!'
  END AS status;

-- =====================================================
-- 2. DUPLICATAS: Verificar wp_post_id único
-- =====================================================

SELECT '🔍 VERIFICAÇÃO DE DUPLICATAS' AS secao;

-- Voluntários
SELECT
  'Voluntários' AS entidade,
  COUNT(*) AS total_duplicatas,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Sem duplicatas'
    ELSE '🔴 ATENÇÃO: Encontradas duplicatas!'
  END AS status
FROM (
  SELECT wp_post_id, COUNT(*)
  FROM volunteers
  WHERE wp_post_id IS NOT NULL
  GROUP BY wp_post_id
  HAVING COUNT(*) > 1
) AS duplicados;

-- Abrigos
SELECT
  'Abrigos' AS entidade,
  COUNT(*) AS total_duplicatas,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Sem duplicatas'
    ELSE '🔴 ATENÇÃO: Encontradas duplicatas!'
  END AS status
FROM (
  SELECT wp_post_id, COUNT(*)
  FROM shelters
  WHERE wp_post_id IS NOT NULL
  GROUP BY wp_post_id
  HAVING COUNT(*) > 1
) AS duplicados;

-- Vagas
SELECT
  'Vagas' AS entidade,
  COUNT(*) AS total_duplicatas,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Sem duplicatas'
    ELSE '🔴 ATENÇÃO: Encontradas duplicatas!'
  END AS status
FROM (
  SELECT wp_post_id, COUNT(*)
  FROM vacancies
  WHERE wp_post_id IS NOT NULL
  GROUP BY wp_post_id
  HAVING COUNT(*) > 1
) AS duplicados;

-- =====================================================
-- 3. SLUGS: Verificar se todos têm slug
-- =====================================================

SELECT '🔗 VERIFICAÇÃO DE SLUGS' AS secao;

-- Voluntários
SELECT
  'Voluntários' AS entidade,
  COUNT(*) AS total_registros,
  COUNT(slug) AS com_slug,
  COUNT(*) - COUNT(slug) AS sem_slug,
  CASE
    WHEN COUNT(*) = COUNT(slug) THEN '✅ Todos com slug'
    ELSE '⚠️  Alguns sem slug'
  END AS status
FROM volunteers;

-- Vagas
SELECT
  'Vagas' AS entidade,
  COUNT(*) AS total_registros,
  COUNT(slug) AS com_slug,
  COUNT(*) - COUNT(slug) AS sem_slug,
  CASE
    WHEN COUNT(*) = COUNT(slug) THEN '✅ Todos com slug'
    ELSE '⚠️  Alguns sem slug'
  END AS status
FROM vacancies;

-- Verificar duplicatas de slug
SELECT
  'Slugs duplicados (volunteers)' AS verificacao,
  COUNT(*) AS total,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '🔴 DUPLICATAS!'
  END AS status
FROM (
  SELECT slug, COUNT(*)
  FROM volunteers
  WHERE slug IS NOT NULL
  GROUP BY slug
  HAVING COUNT(*) > 1
) AS duplicados;

SELECT
  'Slugs duplicados (vacancies)' AS verificacao,
  COUNT(*) AS total,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '🔴 DUPLICATAS!'
  END AS status
FROM (
  SELECT slug, COUNT(*)
  FROM vacancies
  WHERE slug IS NOT NULL
  GROUP BY slug
  HAVING COUNT(*) > 1
) AS duplicados;

-- =====================================================
-- 4. INTEGRIDADE: Campos obrigatórios
-- =====================================================

SELECT '✅ VERIFICAÇÃO DE INTEGRIDADE' AS secao;

-- Voluntários sem nome
SELECT
  'Voluntários sem nome' AS verificacao,
  COUNT(*) AS total,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '🔴 ERRO!'
  END AS status
FROM volunteers
WHERE name IS NULL OR name = '';

-- Abrigos sem nome
SELECT
  'Abrigos sem nome' AS verificacao,
  COUNT(*) AS total,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '🔴 ERRO!'
  END AS status
FROM shelters
WHERE name IS NULL OR name = '';

-- Abrigos sem tipo
SELECT
  'Abrigos sem tipo' AS verificacao,
  COUNT(*) AS total,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '⚠️  ATENÇÃO'
  END AS status
FROM shelters
WHERE shelter_type IS NULL;

-- =====================================================
-- 5. VINCULAÇÃO: profile_id e owner_profile_id
-- =====================================================

SELECT '🔗 VERIFICAÇÃO DE VINCULAÇÃO' AS secao;

-- Abrigos sem perfil (esperado inicialmente)
SELECT
  'Abrigos sem profile_id' AS verificacao,
  COUNT(*) AS total,
  '⚠️  Normal após migração (vincular depois)' AS observacao
FROM shelters
WHERE profile_id IS NULL AND wp_post_id IS NOT NULL;

-- Voluntários sem perfil (esperado inicialmente)
SELECT
  'Voluntários sem owner_profile_id' AS verificacao,
  COUNT(*) AS total,
  '⚠️  Normal após migração (vincular depois)' AS observacao
FROM volunteers
WHERE owner_profile_id IS NULL AND wp_post_id IS NOT NULL;

-- =====================================================
-- 6. ÍNDICES: Verificar se foram criados
-- =====================================================

SELECT '📑 VERIFICAÇÃO DE ÍNDICES' AS secao;

SELECT
  schemaname,
  tablename,
  indexname,
  CASE
    WHEN indexname LIKE '%_pkey' THEN '🔑 Primary Key'
    WHEN indexname LIKE '%_key' THEN '🔒 Unique'
    ELSE '📊 Index'
  END AS tipo
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('volunteers', 'shelters', 'vacancies')
  AND indexname LIKE '%slug%'
ORDER BY tablename, indexname;

-- =====================================================
-- 7. TRIGGERS: Verificar se estão ativos
-- =====================================================

SELECT '⚙️  VERIFICAÇÃO DE TRIGGERS' AS secao;

SELECT
  tgrelid::regclass AS tabela,
  tgname AS trigger,
  CASE tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '🔴 Disabled'
    ELSE 'Other'
  END AS status
FROM pg_trigger
WHERE tgrelid IN (
  'public.shelters'::regclass,
  'public.volunteers'::regclass,
  'public.profiles'::regclass
)
  AND tgname NOT LIKE 'RI_%'
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgrelid, tgname;

-- =====================================================
-- 8. TAMANHO DAS TABELAS
-- =====================================================

SELECT '💾 TAMANHO DAS TABELAS' AS secao;

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'volunteers',
    'shelters',
    'vacancies',
    'shelter_dynamics',
    'shelter_volunteers',
    'shelter_history',
    'wp_posts_raw',
    'wp_postmeta_raw'
  )
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
--
-- ✅ Contagens batem (origem = destino)
-- ✅ Sem duplicatas de wp_post_id
-- ✅ Todos os registros têm slug
-- ✅ Sem duplicatas de slug
-- ✅ Campos obrigatórios preenchidos
-- ⚠️  profile_id/owner_profile_id NULL (normal, vincular depois)
-- ✅ Índices de slug criados
-- ✅ Triggers habilitados
--
-- Se todos os checks estão OK, a migração foi um SUCESSO! 🎉
--
-- =====================================================
-- PRÓXIMOS PASSOS:
-- =====================================================
-- 1. Testar aplicação localmente
-- 2. Implementar auto-link no primeiro login
-- 3. Fazer deploy em produção
-- 4. Monitorar por 24-48h
-- =====================================================
