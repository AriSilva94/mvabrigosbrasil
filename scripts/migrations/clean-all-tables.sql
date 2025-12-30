-- ========================================
-- Script SQL: Limpar TODAS as tabelas
-- ========================================
--
-- ⚠️  ATENÇÃO: Este script deleta TODOS os dados!
--
-- Como usar no Supabase SQL Editor:
-- 1. Acesse o SQL Editor no dashboard do Supabase
-- 2. Cole este script
-- 3. Execute
--
-- ========================================

-- Desabilitar foreign key checks temporariamente
SET session_replication_role = 'replica';

-- Deletar em ordem (dependentes primeiro)
DELETE FROM shelter_dynamics;
DELETE FROM shelter_history;
DELETE FROM shelter_volunteers;
DELETE FROM volunteers;
DELETE FROM vacancies;
DELETE FROM shelters;

-- Deletar todos os profiles (exceto os de auth.users ativos)
-- Se quiser deletar TUDO mesmo, remova a condição WHERE
DELETE FROM profiles;

-- ⚠️  DELETAR USUÁRIOS DO AUTH (CUIDADO!)
-- Isso remove TODOS os usuários autenticados do Supabase
DELETE FROM auth.users;

-- Tabelas WordPress legadas
DELETE FROM wp_postmeta_raw;
DELETE FROM wp_posts_raw;
DELETE FROM wp_users_raw;
DELETE FROM wp_users_legacy;

-- Reabilitar foreign key checks
SET session_replication_role = 'origin';

-- Mostrar contagem final (deve ser 0)
SELECT
  'shelter_dynamics' as tabela,
  COUNT(*) as registros
FROM shelter_dynamics
UNION ALL
SELECT 'shelter_history', COUNT(*) FROM shelter_history
UNION ALL
SELECT 'shelter_volunteers', COUNT(*) FROM shelter_volunteers
UNION ALL
SELECT 'volunteers', COUNT(*) FROM volunteers
UNION ALL
SELECT 'vacancies', COUNT(*) FROM vacancies
UNION ALL
SELECT 'shelters', COUNT(*) FROM shelters
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'wp_postmeta_raw', COUNT(*) FROM wp_postmeta_raw
UNION ALL
SELECT 'wp_posts_raw', COUNT(*) FROM wp_posts_raw
UNION ALL
SELECT 'wp_users_raw', COUNT(*) FROM wp_users_raw
UNION ALL
SELECT 'wp_users_legacy', COUNT(*) FROM wp_users_legacy;
