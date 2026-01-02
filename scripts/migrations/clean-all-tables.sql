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

-- ========================================
-- PASSO 1: LIMPAR AUTH (HARD DELETE - ORDEM CORRETA)
-- ========================================

-- IMPORTANTE: Deletar na ordem correta para respeitar foreign keys

-- 1. Deletar audit logs
DELETE FROM auth.audit_log_entries;

-- 2. Deletar MFA (autenticação de dois fatores)
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_factors;

-- 3. Deletar SSO
DELETE FROM auth.saml_relay_states;
DELETE FROM auth.saml_providers;
DELETE FROM auth.sso_domains;
DELETE FROM auth.sso_providers;

-- 4. Deletar flow states
DELETE FROM auth.flow_state;

-- 5. Deletar sessions (depende de users)
DELETE FROM auth.sessions;

-- 6. Deletar refresh tokens (depende de sessions)
DELETE FROM auth.refresh_tokens;

-- 7. Deletar identities (depende de users)
DELETE FROM auth.identities;

-- 8. DELETAR TODOS OS USUÁRIOS (último, pois outros dependem dele)
-- Isso remove TODOS, incluindo soft-deleted e corrompidos
DELETE FROM auth.users;

-- ========================================
-- PASSO 2: LIMPAR TABELAS DE DOMÍNIO
-- ========================================

-- Deletar em ordem (dependentes primeiro)
DELETE FROM shelter_dynamics;
DELETE FROM shelter_history;
DELETE FROM shelter_volunteers;
DELETE FROM team_memberships;
DELETE FROM volunteers;
DELETE FROM vacancies;
DELETE FROM shelters;
DELETE FROM profiles;

-- ========================================
-- PASSO 3: LIMPAR TABELAS LEGADAS
-- ========================================

DELETE FROM wp_postmeta_raw;
DELETE FROM wp_posts_raw;
DELETE FROM wp_users_raw;
DELETE FROM wp_usermeta_raw;
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
SELECT 'team_memberships', COUNT(*) FROM team_memberships
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
SELECT 'wp_usermeta_raw', COUNT(*) FROM wp_usermeta_raw
UNION ALL
SELECT 'wp_users_raw', COUNT(*) FROM wp_users_raw
UNION ALL
SELECT 'wp_users_legacy', COUNT(*) FROM wp_users_legacy;
