import { NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import {
  mapShelterProfileToDb,
  shelterProfileSchema,
  type ShelterProfileInput,
} from "@/modules/shelter/shelterProfileSchema";
import type { ShelterProfileFormData } from "@/types/shelter.types";

type CurrentUser = { id: string; email: string | null };

async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

function mapDbToFormData(row: Record<string, unknown>): Partial<ShelterProfileFormData> {
  const additionalSpecies = Array.isArray(row.additional_species) ? row.additional_species : [];
  const temporaryAgreementRaw =
    typeof row.temporary_agreement === "string" ? row.temporary_agreement : null;
  const hasTemporaryAgreement =
    temporaryAgreementRaw === "sim" ? true : temporaryAgreementRaw === "nao" ? false : null;

  return {
    shelterType: (row.shelter_type as ShelterProfileFormData["shelterType"]) ?? undefined,
    cnpj: ((row.cnpj as string) ?? (row.cpf as string) ?? "") as string,
    name: (row.name as string) ?? "",
    cep: (row.cep as string) ?? "",
    street: (row.street as string) ?? "",
    number: row.number?.toString?.() ?? "",
    district: (row.district as string) ?? "",
    state: typeof row.state === "string" ? row.state.toUpperCase() : "",
    city: (row.city as string) ?? "",
    website: (row.website as string) ?? "",
    foundationDate: (row.foundation_date as string) ?? "",
    species: (row.species as string) ?? "",
    additionalSpecies,
    hasTemporaryAgreement,
    temporaryAgreement: temporaryAgreementRaw,
    referralSource: (row.referral_source as string) ?? "",
    initialDogs: (row.initial_dogs as number) ?? 0,
    initialCats: (row.initial_cats as number) ?? 0,
    authorizedName: (row.authorized_name as string) ?? "",
    authorizedRole: (row.authorized_role as string) ?? "",
    authorizedEmail: (row.authorized_email as string) ?? "",
    authorizedPhone: (row.authorized_phone as string) ?? "",
    acceptTerms: Boolean(row.accept_terms ?? row.acceptTerms ?? false),
    active: (row.active as boolean) ?? true,
  };
}

function arraysShallowEqual(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function hasChanges(
  current: Record<string, unknown> | null,
  incoming: Record<string, unknown>,
): boolean {
  if (!current) return true;

  return Object.entries(incoming).some(([key, incomingValue]) => {
    const currentValue = key in current ? current[key] : undefined;

    if (Array.isArray(currentValue) || Array.isArray(incomingValue)) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      const incomingArray = Array.isArray(incomingValue) ? incomingValue : [];
      return !arraysShallowEqual(currentArray, incomingArray);
    }

    return (currentValue ?? null) !== (incomingValue ?? null);
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("shelters")
      .select(
        "id, profile_id, active, shelter_type, cnpj, cpf, name, cep, street, number, district, state, city, website, foundation_date, species, additional_species, temporary_agreement, referral_source, initial_dogs, initial_cats, authorized_name, authorized_role, authorized_email, authorized_phone, accept_terms",
      )
      .eq("profile_id", user.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      const isUnknownColumn = error.code === "42703";
      if (!isUnknownColumn) {
        console.error("shelter-profile GET: erro ao consultar shelters", error);
        return NextResponse.json({ error: "Erro ao consultar cadastro" }, { status: 500 });
      }

      // Se a coluna ainda não existir, devolve cadastro vazio para não bloquear uso.
      return NextResponse.json({ shelter: null, warning: "Campo profile_id ausente em shelters." });
    }

    if (!data) {
      return NextResponse.json({ shelter: null });
    }

    return NextResponse.json({ shelter: mapDbToFormData(data) });
  } catch (error) {
    console.error("shelter-profile GET: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao carregar cadastro" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const json = (await request.json()) as Partial<ShelterProfileInput>;
    const parsed = shelterProfileSchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Verifica se o profile existe; não cria automaticamente para respeitar o fluxo de cadastro.
    const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileLookupError) {
      console.error("shelter-profile POST: erro ao verificar profile", profileLookupError);
      return NextResponse.json({ error: "Erro ao validar usuário" }, { status: 500 });
    }

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Perfil do usuário não encontrado. Refaça o login ou contate o suporte." },
        { status: 409 },
      );
    }

    const { data: existingShelter, error: currentShelterError } = await supabaseAdmin
      .from("shelters")
      .select(
        "id, profile_id, active, shelter_type, cnpj, cpf, name, cep, street, number, district, state, city, website, foundation_date, species, additional_species, temporary_agreement, referral_source, initial_dogs, initial_cats, authorized_name, authorized_role, authorized_email, authorized_phone, accept_terms",
      )
      .eq("profile_id", user.id)
      .limit(1)
      .maybeSingle();

    if (currentShelterError) {
      const isUnknownColumn = currentShelterError.code === "42703";
      if (!isUnknownColumn) {
        console.error(
          "shelter-profile POST: erro ao consultar cadastro existente",
          currentShelterError,
        );
        return NextResponse.json({ error: "Erro ao consultar cadastro" }, { status: 500 });
      }
    }

    const payload = mapShelterProfileToDb(user.id, parsed.data);

    const normalizedCurrentShelter = existingShelter
      ? {
          ...existingShelter,
          additional_species: Array.isArray(existingShelter.additional_species)
            ? existingShelter.additional_species
            : [],
          website: existingShelter.website ?? null,
          temporary_agreement: existingShelter.temporary_agreement ?? null,
          cnpj: existingShelter.cnpj ?? null,
          cpf: existingShelter.cpf ?? null,
        }
      : null;

    if (normalizedCurrentShelter && !hasChanges(normalizedCurrentShelter, payload)) {
      return NextResponse.json({
        ok: true,
        shelter: mapDbToFormData(normalizedCurrentShelter),
      });
    }

    const { data, error } = await supabaseAdmin
      .from("shelters")
      .upsert(payload, { onConflict: "profile_id" })
      .select(
        "id, profile_id, active, shelter_type, cnpj, cpf, name, cep, street, number, district, state, city, website, foundation_date, species, additional_species, temporary_agreement, referral_source, initial_dogs, initial_cats, authorized_name, authorized_role, authorized_email, authorized_phone, accept_terms",
      )
      .maybeSingle();

    if (error) {
      console.error("shelter-profile POST: erro ao salvar shelters", error);
      return NextResponse.json({ error: "Erro ao salvar cadastro" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      shelter: data ? mapDbToFormData(data) : null,
    });
  } catch (error) {
    console.error("shelter-profile POST: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao salvar cadastro" }, { status: 500 });
  }
}
