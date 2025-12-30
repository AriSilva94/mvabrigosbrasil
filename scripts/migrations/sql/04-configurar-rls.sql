-- =====================================================
-- SCRIPT 04: Configurar Row Level Security (RLS)
-- =====================================================
--
-- Descrição:
--   Habilita RLS e cria policies de segurança para
--   controlar acesso às tabelas.
--
-- Quando executar:
--   APÓS criar triggers e funções (script 03)
--   ANTES de rodar os scripts de migração
--
-- Estratégia:
--   - Tabelas públicas (shelters, volunteers, etc): leitura pública
--   - Tabelas legadas (wp_*): bloqueadas para anon/authenticated
--   - Escrita: apenas via backend (service_role)
--
-- =====================================================

-- =====================================================
-- 1. Habilitar RLS em todas as tabelas
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelter_dynamics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelter_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelter_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Policies: profiles
-- =====================================================

-- Usuários podem ver o próprio perfil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar o próprio perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 3. Policies: shelters
-- =====================================================

-- Leitura pública (todos podem ver)
DROP POLICY IF EXISTS "Shelters are viewable by everyone" ON public.shelters;
CREATE POLICY "Shelters are viewable by everyone"
  ON public.shelters
  FOR SELECT
  USING (true);

-- Escrita apenas via backend (service_role bypass RLS automaticamente)

-- =====================================================
-- 4. Policies: volunteers
-- =====================================================

-- Leitura pública (todos podem ver)
DROP POLICY IF EXISTS "Volunteers are viewable by everyone" ON public.volunteers;
CREATE POLICY "Volunteers are viewable by everyone"
  ON public.volunteers
  FOR SELECT
  USING (true);

-- Escrita apenas via backend

-- =====================================================
-- 5. Policies: vacancies
-- =====================================================

-- Leitura pública
DROP POLICY IF EXISTS "Vacancies are viewable by everyone" ON public.vacancies;
CREATE POLICY "Vacancies are viewable by everyone"
  ON public.vacancies
  FOR SELECT
  USING (true);

-- =====================================================
-- 6. Policies: shelter_dynamics
-- =====================================================

-- Leitura pública
DROP POLICY IF EXISTS "Shelter dynamics are viewable by everyone" ON public.shelter_dynamics;
CREATE POLICY "Shelter dynamics are viewable by everyone"
  ON public.shelter_dynamics
  FOR SELECT
  USING (true);

-- =====================================================
-- 7. Policies: shelter_volunteers
-- =====================================================

-- Leitura pública
DROP POLICY IF EXISTS "Shelter volunteers are viewable by everyone" ON public.shelter_volunteers;
CREATE POLICY "Shelter volunteers are viewable by everyone"
  ON public.shelter_volunteers
  FOR SELECT
  USING (true);

-- =====================================================
-- 8. Policies: shelter_history
-- =====================================================

-- Usuários veem apenas histórico dos próprios abrigos
DROP POLICY IF EXISTS "Users can view their own shelter history" ON public.shelter_history;
CREATE POLICY "Users can view their own shelter history"
  ON public.shelter_history
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Sistema pode inserir registros (via trigger)
DROP POLICY IF EXISTS "System can insert shelter history" ON public.shelter_history;
CREATE POLICY "System can insert shelter history"
  ON public.shelter_history
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 9. Verificar RLS e Policies
-- =====================================================

-- Verificar quais tabelas têm RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'shelters',
    'volunteers',
    'vacancies',
    'shelter_dynamics',
    'shelter_volunteers',
    'shelter_history'
  )
ORDER BY tablename;

-- Verificar policies criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual IS NOT NULL AS has_using,
  with_check IS NOT NULL AS has_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Todas as 7 tabelas com rls_enabled = true
-- Policies criadas para leitura pública e restrição de escrita
--
-- PRÓXIMO PASSO:
-- =====================================================
-- Agora o ambiente está PRONTO para migração!
--
-- Antes de executar os scripts de migração, você precisa:
-- 1. Criar arquivo .env.local com as chaves do Supabase
-- 2. Importar backup do WordPress nas tabelas *_raw
-- 3. Validar que os dados foram importados corretamente
--
-- Quando estiver pronto, me avise para executar:
-- - Script 05: Desabilitar trigger de histórico
-- - Scripts JS de migração (via node)
-- - Script 06: Reabilitar trigger de histórico
-- =====================================================
