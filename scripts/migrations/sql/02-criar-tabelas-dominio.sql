-- =====================================================
-- SCRIPT 02: Criar Tabelas de Domínio
-- =====================================================
--
-- Descrição:
--   Cria as tabelas principais da aplicação que vão
--   receber os dados migrados do WordPress.
--
-- Quando executar:
--   APÓS criar as tabelas legadas (script 01)
--   ANTES de rodar os scripts de migração
--
-- Ordem de criação:
--   1. profiles (depende de auth.users - já existe)
--   2. shelters (depende de profiles)
--   3. volunteers (depende de profiles)
--   4. vacancies (depende de shelters)
--   5. shelter_dynamics (depende de shelters)
--   6. shelter_volunteers (depende de shelters + volunteers)
--   7. shelter_history (auditoria de shelters)
--
-- =====================================================

-- =====================================================
-- 1. Tabela: profiles
-- =====================================================
-- Perfis de usuários (vinculada 1:1 com auth.users)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT,
  wp_user_id INTEGER UNIQUE,
  origin TEXT NOT NULL DEFAULT 'supabase_native',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_wp_user_id ON public.profiles(wp_user_id) WHERE wp_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema - vinculado a auth.users';
COMMENT ON COLUMN public.profiles.wp_user_id IS 'ID do usuário no WordPress (para usuários migrados)';
COMMENT ON COLUMN public.profiles.origin IS 'Origem do cadastro: supabase_native, wordpress_migrated, admin_created';

-- =====================================================
-- 2. Tabela: shelters
-- =====================================================
-- Abrigos de animais

CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_post_id INTEGER UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shelter_type TEXT NOT NULL,
  cnpj TEXT,
  cpf TEXT,
  name TEXT NOT NULL,
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  website TEXT,
  foundation_date TEXT NOT NULL,
  species TEXT NOT NULL,
  additional_species TEXT DEFAULT '[]',
  temporary_agreement BOOLEAN,
  initial_dogs INTEGER NOT NULL DEFAULT 0,
  initial_cats INTEGER NOT NULL DEFAULT 0,
  authorized_name TEXT NOT NULL,
  authorized_role TEXT NOT NULL,
  authorized_email TEXT NOT NULL,
  authorized_phone TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  accept_terms BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shelters_profile_id ON public.shelters(profile_id);
CREATE INDEX IF NOT EXISTS idx_shelters_wp_post_id ON public.shelters(wp_post_id) WHERE wp_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shelters_state_city ON public.shelters(state, city);
CREATE INDEX IF NOT EXISTS idx_shelters_active ON public.shelters(active);
CREATE INDEX IF NOT EXISTS idx_shelters_species ON public.shelters(species);

-- Constraints
ALTER TABLE public.shelters ADD CONSTRAINT shelters_initial_dogs_check CHECK (initial_dogs >= 0);
ALTER TABLE public.shelters ADD CONSTRAINT shelters_initial_cats_check CHECK (initial_cats >= 0);

COMMENT ON TABLE public.shelters IS 'Abrigos de animais - substitui post_type=abrigo do WordPress';
COMMENT ON COLUMN public.shelters.wp_post_id IS 'ID do post original no WordPress - usado para rastreabilidade e migração idempotente';

-- =====================================================
-- 3. Tabela: volunteers
-- =====================================================
-- Voluntários

CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_post_id INTEGER UNIQUE,
  owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  profissao TEXT,
  escolaridade TEXT,
  faixa_etaria TEXT,
  genero TEXT,
  experiencia TEXT,
  atuacao TEXT,
  disponibilidade TEXT,
  periodo TEXT,
  descricao TEXT,
  comentarios TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  accept_terms BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_volunteers_owner_profile_id ON public.volunteers(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_wp_post_id ON public.volunteers(wp_post_id) WHERE wp_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_volunteers_state_city ON public.volunteers(estado, cidade);
CREATE INDEX IF NOT EXISTS idx_volunteers_is_public ON public.volunteers(is_public);

COMMENT ON TABLE public.volunteers IS 'Voluntários - substitui post_type=voluntario do WordPress';
COMMENT ON COLUMN public.volunteers.wp_post_id IS 'ID do post original no WordPress';
COMMENT ON COLUMN public.volunteers.slug IS 'Slug para URL amigável (será populado após migração)';

-- =====================================================
-- 4. Tabela: vacancies
-- =====================================================
-- Vagas de trabalho/estágio

CREATE TABLE IF NOT EXISTS public.vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_post_id INTEGER UNIQUE,
  shelter_id UUID REFERENCES public.shelters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vacancies_shelter_id ON public.vacancies(shelter_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_wp_post_id ON public.vacancies(wp_post_id) WHERE wp_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON public.vacancies(status);

COMMENT ON TABLE public.vacancies IS 'Vagas de trabalho/estágio - substitui post_type=vaga do WordPress';
COMMENT ON COLUMN public.vacancies.description IS 'JSON serializado com campos do formulário original';

-- =====================================================
-- 5. Tabela: shelter_dynamics
-- =====================================================
-- Dinâmicas populacionais dos abrigos

CREATE TABLE IF NOT EXISTS public.shelter_dynamics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  reference_date DATE,
  reference_period TEXT,
  dynamic_type TEXT NOT NULL DEFAULT 'dinamica',
  entradas_de_animais INTEGER DEFAULT 0,
  entradas_de_gatos INTEGER DEFAULT 0,
  adocoes_caes INTEGER DEFAULT 0,
  adocoes_gatos INTEGER DEFAULT 0,
  devolucoes_caes INTEGER DEFAULT 0,
  devolucoes_gatos INTEGER DEFAULT 0,
  eutanasias_caes INTEGER DEFAULT 0,
  eutanasias_gatos INTEGER DEFAULT 0,
  mortes_naturais_caes INTEGER DEFAULT 0,
  mortes_naturais_gatos INTEGER DEFAULT 0,
  doencas_caes INTEGER DEFAULT 0,
  doencas_gatos INTEGER DEFAULT 0,
  retorno_de_caes INTEGER DEFAULT 0,
  retorno_de_gatos INTEGER DEFAULT 0,
  retorno_local_caes INTEGER DEFAULT 0,
  retorno_local_gatos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shelter_dynamics_shelter_id ON public.shelter_dynamics(shelter_id);
CREATE UNIQUE INDEX IF NOT EXISTS shelter_dynamics_unique_ref
ON public.shelter_dynamics(shelter_id, dynamic_type, reference_period);

COMMENT ON TABLE public.shelter_dynamics IS 'Dinâmicas populacionais dos abrigos';
COMMENT ON COLUMN public.shelter_dynamics.kind IS 'abrigo (dinâmica) ou lar (dinâmica de lar temporário)';

-- =====================================================
-- 6. Tabela: shelter_volunteers
-- =====================================================
-- Relação muitos-para-muitos entre abrigos e voluntários

CREATE TABLE IF NOT EXISTS public.shelter_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(shelter_id, volunteer_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shelter_volunteers_shelter_id ON public.shelter_volunteers(shelter_id);
CREATE INDEX IF NOT EXISTS idx_shelter_volunteers_volunteer_id ON public.shelter_volunteers(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_shelter_volunteers_status ON public.shelter_volunteers(status);

COMMENT ON TABLE public.shelter_volunteers IS 'Relação entre abrigos e voluntários';

-- =====================================================
-- 7. Tabela: shelter_history
-- =====================================================
-- Histórico de alterações em abrigos

CREATE TABLE IF NOT EXISTS public.shelter_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shelter_history_shelter_id ON public.shelter_history(shelter_id);
CREATE INDEX IF NOT EXISTS idx_shelter_history_profile_id ON public.shelter_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_shelter_history_changed_at ON public.shelter_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_shelter_history_operation ON public.shelter_history(operation);

-- Constraint
ALTER TABLE public.shelter_history ADD CONSTRAINT shelter_history_operation_check
CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE'));

COMMENT ON TABLE public.shelter_history IS 'Histórico de alterações em cadastros de abrigos';

-- =====================================================
-- 8. Verificar criação
-- =====================================================

SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size('public.' || table_name)) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'shelters',
    'volunteers',
    'vacancies',
    'shelter_dynamics',
    'shelter_volunteers',
    'shelter_history'
  )
ORDER BY table_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- 7 tabelas criadas com sucesso
-- Todas com size = 8192 bytes (vazias)
--
-- PRÓXIMO PASSO: Executar script 03 (triggers e funções)
-- =====================================================
