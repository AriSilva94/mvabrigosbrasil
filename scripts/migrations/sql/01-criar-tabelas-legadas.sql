-- =====================================================
-- SCRIPT 01: Criar Tabelas Legadas (Backup WordPress)
-- =====================================================
--
-- Descrição:
--   Cria as tabelas que vão receber o dump do WordPress.
--   Estas tabelas são a FONTE dos dados para migração.
--
-- Quando executar:
--   ANTES de importar o backup do WordPress
--
-- IMPORTANTE:
--   Após executar este script, você precisa importar os
--   dados do WordPress nestas tabelas usando pgAdmin,
--   psql ou ferramenta de sua preferência.
--
-- =====================================================

-- =====================================================
-- 1. Tabela: wp_users_raw
-- =====================================================
-- Dump completo da tabela wp_users do WordPress

CREATE TABLE IF NOT EXISTS public.wp_users_raw (
  id BIGSERIAL PRIMARY KEY,
  user_login VARCHAR(60) NOT NULL,
  user_pass VARCHAR(255) NOT NULL,
  user_nicename VARCHAR(50) NOT NULL,
  user_email VARCHAR(100) NOT NULL,
  user_url VARCHAR(100),
  user_registered TIMESTAMP,
  user_activation_key VARCHAR(255),
  user_status INTEGER DEFAULT 0,
  display_name VARCHAR(250)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wp_users_raw_email ON public.wp_users_raw(user_email);
CREATE INDEX IF NOT EXISTS idx_wp_users_raw_login ON public.wp_users_raw(user_login);

COMMENT ON TABLE public.wp_users_raw IS 'Dump bruto da tabela wp_users do WordPress - usado apenas para migração';

-- =====================================================
-- 2. Tabela: wp_users_legacy
-- =====================================================
-- Versão reduzida para login de usuários migrados

CREATE TABLE IF NOT EXISTS public.wp_users_legacy (
  id BIGINT PRIMARY KEY,
  user_login VARCHAR(60) NOT NULL UNIQUE,
  user_email VARCHAR(100) NOT NULL UNIQUE,
  user_pass VARCHAR(255) NOT NULL,
  display_name VARCHAR(250),
  migrated BOOLEAN DEFAULT FALSE,
  migrated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_wp_users_legacy_email ON public.wp_users_legacy(user_email);
CREATE INDEX IF NOT EXISTS idx_wp_users_legacy_migrated ON public.wp_users_legacy(migrated) WHERE migrated = FALSE;

COMMENT ON TABLE public.wp_users_legacy IS 'Usuários do WordPress para migração gradual no primeiro login';

-- =====================================================
-- 3. Tabela: wp_posts_raw
-- =====================================================
-- Dump completo da tabela wp_posts do WordPress

CREATE TABLE IF NOT EXISTS public.wp_posts_raw (
  id BIGSERIAL PRIMARY KEY,
  post_author BIGINT,
  post_date TIMESTAMP,
  post_date_gmt TIMESTAMP,
  post_content TEXT,
  post_title TEXT,
  post_excerpt TEXT,
  post_status VARCHAR(20),
  comment_status VARCHAR(20),
  ping_status VARCHAR(20),
  post_password VARCHAR(255),
  post_name VARCHAR(200),
  to_ping TEXT,
  pinged TEXT,
  post_modified TIMESTAMP,
  post_modified_gmt TIMESTAMP,
  post_content_filtered TEXT,
  post_parent BIGINT,
  guid VARCHAR(255),
  menu_order INTEGER,
  post_type VARCHAR(20),
  post_mime_type VARCHAR(100),
  comment_count BIGINT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wp_posts_raw_type ON public.wp_posts_raw(post_type);
CREATE INDEX IF NOT EXISTS idx_wp_posts_raw_status ON public.wp_posts_raw(post_status);
CREATE INDEX IF NOT EXISTS idx_wp_posts_raw_author ON public.wp_posts_raw(post_author);

-- Índice específico para migração
CREATE INDEX IF NOT EXISTS idx_wp_posts_raw_type_status
ON public.wp_posts_raw(post_type, post_status);

COMMENT ON TABLE public.wp_posts_raw IS 'Dump bruto da tabela wp_posts do WordPress - fonte para migração de abrigos, voluntários e vagas';

-- =====================================================
-- 4. Tabela: wp_postmeta_raw
-- =====================================================
-- Dump completo da tabela wp_postmeta do WordPress

CREATE TABLE IF NOT EXISTS public.wp_postmeta_raw (
  meta_id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL,
  meta_key VARCHAR(255),
  meta_value TEXT
);

-- Índices para performance (CRÍTICO para migração)
CREATE INDEX IF NOT EXISTS idx_wp_postmeta_raw_post_id ON public.wp_postmeta_raw(post_id);
CREATE INDEX IF NOT EXISTS idx_wp_postmeta_raw_key ON public.wp_postmeta_raw(meta_key);
CREATE INDEX IF NOT EXISTS idx_wp_postmeta_raw_post_key ON public.wp_postmeta_raw(post_id, meta_key);

COMMENT ON TABLE public.wp_postmeta_raw IS 'Dump bruto da tabela wp_postmeta do WordPress - metadados customizados dos posts';

-- =====================================================
-- 5. Habilitar RLS (Bloquear acesso público)
-- =====================================================
-- IMPORTANTE: Estas tabelas SÓ devem ser acessadas via
-- Service Role Key (backend), NUNCA pelo frontend

ALTER TABLE public.wp_users_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wp_users_legacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wp_posts_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wp_postmeta_raw ENABLE ROW LEVEL SECURITY;

-- Revogar acesso de anon e authenticated
REVOKE ALL ON public.wp_users_raw FROM anon, authenticated;
REVOKE ALL ON public.wp_users_legacy FROM anon, authenticated;
REVOKE ALL ON public.wp_posts_raw FROM anon, authenticated;
REVOKE ALL ON public.wp_postmeta_raw FROM anon, authenticated;

-- =====================================================
-- 6. Verificar criação
-- =====================================================

SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size('public.' || table_name)) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('wp_users_raw', 'wp_users_legacy', 'wp_posts_raw', 'wp_postmeta_raw')
ORDER BY table_name;

-- =====================================================
-- PRÓXIMO PASSO:
-- =====================================================
-- 1. Exportar dump do MySQL do WordPress
-- 2. Converter para PostgreSQL (se necessário)
-- 3. Importar dados nestas tabelas
-- 4. Executar validação:
--
--    SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'voluntario';
--    SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'abrigo';
--    SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'vaga';
--    SELECT COUNT(*) FROM wp_postmeta_raw;
--
-- =====================================================
