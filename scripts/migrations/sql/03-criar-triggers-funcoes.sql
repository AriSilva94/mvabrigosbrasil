-- =====================================================
-- SCRIPT 03: Criar Triggers e Funções
-- =====================================================
--
-- Descrição:
--   Cria funções e triggers para automação:
--   - Atualização automática de updated_at
--   - Auditoria de alterações em shelters
--
-- Quando executar:
--   APÓS criar as tabelas de domínio (script 02)
--   ANTES de rodar os scripts de migração
--
-- =====================================================

-- =====================================================
-- 1. Função: set_timestamp_profiles()
-- =====================================================
-- Atualiza automaticamente o campo updated_at em profiles

CREATE OR REPLACE FUNCTION public.set_timestamp_profiles()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
DROP TRIGGER IF EXISTS trigger_set_timestamp_profiles ON public.profiles;
CREATE TRIGGER trigger_set_timestamp_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp_profiles();

COMMENT ON FUNCTION public.set_timestamp_profiles() IS 'Atualiza automaticamente updated_at em profiles';

-- =====================================================
-- 2. Função: set_timestamp_volunteers()
-- =====================================================
-- Atualiza automaticamente o campo updated_at em volunteers

CREATE OR REPLACE FUNCTION public.set_timestamp_volunteers()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para volunteers
DROP TRIGGER IF EXISTS trigger_set_timestamp_volunteers ON public.volunteers;
CREATE TRIGGER trigger_set_timestamp_volunteers
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp_volunteers();

COMMENT ON FUNCTION public.set_timestamp_volunteers() IS 'Atualiza automaticamente updated_at em volunteers';

-- =====================================================
-- 3. Função: set_timestamp_shelters()
-- =====================================================
-- Atualiza automaticamente o campo updated_at em shelters

CREATE OR REPLACE FUNCTION public.set_timestamp_shelters()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para shelters
DROP TRIGGER IF EXISTS trigger_set_timestamp_shelters ON public.shelters;
CREATE TRIGGER trigger_set_timestamp_shelters
  BEFORE UPDATE ON public.shelters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp_shelters();

COMMENT ON FUNCTION public.set_timestamp_shelters() IS 'Atualiza automaticamente updated_at em shelters';

-- =====================================================
-- 4. Função: log_shelter_changes()
-- =====================================================
-- Registra automaticamente alterações em shelters na
-- tabela shelter_history

CREATE OR REPLACE FUNCTION public.log_shelter_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields TEXT[] := ARRAY[]::TEXT[];
  v_operation VARCHAR(20);
  v_old_data JSONB;
  v_new_data JSONB;
BEGIN
  -- Determina tipo de operação
  IF (TG_OP = 'DELETE') THEN
    v_operation := 'DELETE';
    v_old_data := row_to_json(OLD)::JSONB;
    v_new_data := NULL;

  ELSIF (TG_OP = 'INSERT') THEN
    v_operation := 'INSERT';
    v_old_data := NULL;
    v_new_data := row_to_json(NEW)::JSONB;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- Detecta mudança apenas de status
    IF (OLD.active IS DISTINCT FROM NEW.active) AND
       (OLD.name = NEW.name) AND
       (OLD.cnpj IS NOT DISTINCT FROM NEW.cnpj) THEN
      v_operation := 'STATUS_CHANGE';
    ELSE
      v_operation := 'UPDATE';
    END IF;

    v_old_data := row_to_json(OLD)::JSONB;
    v_new_data := row_to_json(NEW)::JSONB;

    -- Detecta campos alterados
    IF (OLD.name IS DISTINCT FROM NEW.name) THEN
      v_changed_fields := array_append(v_changed_fields, 'name');
    END IF;
    IF (OLD.shelter_type IS DISTINCT FROM NEW.shelter_type) THEN
      v_changed_fields := array_append(v_changed_fields, 'shelter_type');
    END IF;
    IF (OLD.cnpj IS DISTINCT FROM NEW.cnpj) THEN
      v_changed_fields := array_append(v_changed_fields, 'cnpj');
    END IF;
    IF (OLD.cpf IS DISTINCT FROM NEW.cpf) THEN
      v_changed_fields := array_append(v_changed_fields, 'cpf');
    END IF;
    IF (OLD.street IS DISTINCT FROM NEW.street) THEN
      v_changed_fields := array_append(v_changed_fields, 'street');
    END IF;
    IF (OLD.number IS DISTINCT FROM NEW.number) THEN
      v_changed_fields := array_append(v_changed_fields, 'number');
    END IF;
    IF (OLD.district IS DISTINCT FROM NEW.district) THEN
      v_changed_fields := array_append(v_changed_fields, 'district');
    END IF;
    IF (OLD.city IS DISTINCT FROM NEW.city) THEN
      v_changed_fields := array_append(v_changed_fields, 'city');
    END IF;
    IF (OLD.state IS DISTINCT FROM NEW.state) THEN
      v_changed_fields := array_append(v_changed_fields, 'state');
    END IF;
    IF (OLD.active IS DISTINCT FROM NEW.active) THEN
      v_changed_fields := array_append(v_changed_fields, 'active');
    END IF;
    IF (OLD.authorized_name IS DISTINCT FROM NEW.authorized_name) THEN
      v_changed_fields := array_append(v_changed_fields, 'authorized_name');
    END IF;
    IF (OLD.authorized_email IS DISTINCT FROM NEW.authorized_email) THEN
      v_changed_fields := array_append(v_changed_fields, 'authorized_email');
    END IF;
    IF (OLD.authorized_phone IS DISTINCT FROM NEW.authorized_phone) THEN
      v_changed_fields := array_append(v_changed_fields, 'authorized_phone');
    END IF;
  END IF;

  -- Insere registro no histórico
  INSERT INTO public.shelter_history (
    shelter_id,
    profile_id,
    operation,
    old_data,
    new_data,
    changed_fields,
    changed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.profile_id, OLD.profile_id),
    v_operation,
    v_old_data,
    v_new_data,
    v_changed_fields,
    auth.uid()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para shelter_history
-- IMPORTANTE: Este trigger será DESABILITADO durante migração
-- e REABILITADO depois (ver scripts 04 e 05)
DROP TRIGGER IF EXISTS trigger_shelter_history ON public.shelters;
CREATE TRIGGER trigger_shelter_history
  AFTER INSERT OR UPDATE OR DELETE ON public.shelters
  FOR EACH ROW
  EXECUTE FUNCTION public.log_shelter_changes();

COMMENT ON FUNCTION public.log_shelter_changes() IS 'Registra automaticamente alterações em shelters';

-- =====================================================
-- 5. Verificar criação de triggers
-- =====================================================

SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    ELSE 'Other'
  END AS status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid::regclass::text LIKE 'public.%'
  AND tgname NOT LIKE 'RI_%'
  AND tgname NOT LIKE 'pg_%'
ORDER BY table_name, trigger_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Triggers criados:
-- - trigger_set_timestamp_profiles (profiles) - Enabled
-- - trigger_set_timestamp_volunteers (volunteers) - Enabled
-- - trigger_set_timestamp_shelters (shelters) - Enabled
-- - trigger_shelter_history (shelters) - Enabled
--
-- PRÓXIMO PASSO: Executar script 04 (configurar RLS)
-- =====================================================
