import { NextResponse } from "next/server";

import { REGISTER_TYPES } from "@/constants/registerTypes";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";
import { findProfileById } from "@/modules/auth/repositories/profileRepository";

// Campos obrigatórios para abrigos
const REQUIRED_SHELTER_FIELDS = [
  "shelter_type",
  "name",
  "cep",
  "street",
  "number",
  "district",
  "state",
  "city",
  "foundation_date",
  "species",
  "referral_source",
  "authorized_name",
  "authorized_role",
  "authorized_email",
  "authorized_phone",
] as const;

// Campos obrigatórios para voluntários
const REQUIRED_VOLUNTEER_FIELDS = [
  "name",
  "telefone",
  "profissao",
  "faixa_etaria",
  "genero",
  "escolaridade",
  "estado",
  "cidade",
  "disponibilidade",
  "periodo",
  "experiencia",
  "atuacao",
  "descricao",
  "referral_source",
] as const;

type ShelterField = (typeof REQUIRED_SHELTER_FIELDS)[number] | "document";
type VolunteerField = (typeof REQUIRED_VOLUNTEER_FIELDS)[number];

function isFieldEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "number" && isNaN(value)) return true;
  return false;
}

function validateShelterFields(data: Record<string, unknown>): ShelterField[] {
  const missingFields: ShelterField[] = [];

  for (const field of REQUIRED_SHELTER_FIELDS) {
    if (isFieldEmpty(data[field])) {
      missingFields.push(field);
    }
  }

  // Validação especial para documento (CNPJ ou CPF)
  const hasCnpj = !isFieldEmpty(data.cnpj);
  const hasCpf = !isFieldEmpty(data.cpf);
  const isTemporary = data.shelter_type === "temporary";

  // Se for temporário precisa de CPF, senão precisa de CNPJ
  if (isTemporary && !hasCpf) {
    missingFields.push("document");
  } else if (!isTemporary && !hasCnpj) {
    missingFields.push("document");
  }

  return missingFields;
}

function validateVolunteerFields(data: Record<string, unknown>): VolunteerField[] {
  const missingFields: VolunteerField[] = [];

  for (const field of REQUIRED_VOLUNTEER_FIELDS) {
    if (isFieldEmpty(data[field])) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

export async function GET() {
  try {
    const supabase = await getServerSupabaseClient({ readOnly: true });
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email ?? null;
    const supabaseAdmin = getSupabaseAdminClient();

    // Resolve o tipo de registro do usuário
    const registerType = await resolvePostTypeForUser(supabaseAdmin, {
      supabaseUserId: userId,
      email: userEmail,
    });

    // Verifica se o usuário é convidado (team-only)
    const { profile } = await findProfileById(supabaseAdmin, userId);
    const isTeamOnly = Boolean(profile?.is_team_only);

    // Admin, gerente e convidados não precisam de validação
    if (
      registerType === REGISTER_TYPES.admin ||
      registerType === REGISTER_TYPES.manager ||
      isTeamOnly ||
      !registerType
    ) {
      return NextResponse.json({
        isValid: true,
        requiresProfileUpdate: false,
        missingFields: [],
        registerType,
        profileExists: true,
      });
    }

    // Verifica perfil de abrigo
    if (registerType === REGISTER_TYPES.shelter) {
      const { data: shelterData, error: shelterError } = await supabaseAdmin
        .from("shelters")
        .select("*")
        .eq("profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (shelterError) {
        console.error("validate-profile: erro ao consultar shelters", shelterError);
        return NextResponse.json({ error: "Erro ao validar perfil" }, { status: 500 });
      }

      // Se não tem cadastro de abrigo
      if (!shelterData) {
        return NextResponse.json({
          isValid: false,
          requiresProfileUpdate: true,
          missingFields: [...REQUIRED_SHELTER_FIELDS],
          registerType,
          profileExists: false,
        });
      }

      const missingFields = validateShelterFields(shelterData);
      const isValid = missingFields.length === 0;

      return NextResponse.json({
        isValid,
        requiresProfileUpdate: !isValid,
        missingFields,
        registerType,
        profileExists: true,
      });
    }

    // Verifica perfil de voluntário
    if (registerType === REGISTER_TYPES.volunteer) {
      const { data: volunteerData, error: volunteerError } = await supabaseAdmin
        .from("volunteers")
        .select("*")
        .eq("owner_profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (volunteerError) {
        console.error("validate-profile: erro ao consultar volunteers", volunteerError);
        return NextResponse.json({ error: "Erro ao validar perfil" }, { status: 500 });
      }

      // Se não tem cadastro de voluntário
      if (!volunteerData) {
        return NextResponse.json({
          isValid: false,
          requiresProfileUpdate: true,
          missingFields: [...REQUIRED_VOLUNTEER_FIELDS],
          registerType,
          profileExists: false,
        });
      }

      const missingFields = validateVolunteerFields(volunteerData);
      const isValid = missingFields.length === 0;

      return NextResponse.json({
        isValid,
        requiresProfileUpdate: !isValid,
        missingFields,
        registerType,
        profileExists: true,
      });
    }

    // Fallback para tipos desconhecidos
    return NextResponse.json({
      isValid: true,
      requiresProfileUpdate: false,
      missingFields: [],
      registerType,
      profileExists: false,
    });
  } catch (error) {
    console.error("validate-profile: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao validar perfil" }, { status: 500 });
  }
}
