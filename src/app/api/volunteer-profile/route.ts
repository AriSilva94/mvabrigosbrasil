import { NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import {
  mapVolunteerProfileToDb,
  volunteerProfileSchema,
  type VolunteerProfileInput,
} from "@/modules/volunteer/volunteerProfileSchema";
import type { VolunteerProfileFormData } from "@/types/volunteer.types";

type CurrentUser = { id: string; email: string | null };

async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

function mapDbToFormData(row: Record<string, unknown>): Partial<VolunteerProfileFormData> {
  return {
    name: (row.name as string) ?? "",
    telefone: (row.telefone as string) ?? "",
    profissao: (row.profissao as string) ?? "",
    faixa_etaria: (row.faixa_etaria as string) ?? "",
    genero: (row.genero as string) ?? "",
    escolaridade: (row.escolaridade as string) ?? "",
    estado: (row.estado as string) ?? "",
    cidade: (row.cidade as string) ?? "",
    disponibilidade: (row.disponibilidade as string) ?? "",
    periodo: (row.periodo as string) ?? "",
    experiencia: (row.experiencia as string) ?? "",
    atuacao: (row.atuacao as string) ?? "",
    descricao: (row.descricao as string) ?? "",
    comentarios: (row.comentarios as string) ?? "",
    acceptTerms: (row.accept_terms as boolean) ?? true,
    is_public: (row.is_public as boolean) ?? false,
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
      .from("volunteers")
      .select(
        "id, owner_profile_id, name, telefone, profissao, faixa_etaria, genero, escolaridade, estado, cidade, disponibilidade, periodo, experiencia, atuacao, descricao, comentarios, is_public, accept_terms",
      )
      .eq("owner_profile_id", user.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      const isUnknownColumn = error.code === "42703";
      if (!isUnknownColumn) {
        console.error("volunteer-profile GET: erro ao consultar volunteers", error);
        return NextResponse.json({ error: "Erro ao consultar cadastro" }, { status: 500 });
      }

      // Se a coluna ainda não existir, devolve cadastro vazio para não bloquear uso.
      return NextResponse.json({ volunteer: null, warning: "Campo owner_profile_id ausente em volunteers." });
    }

    if (!data) {
      return NextResponse.json({ volunteer: null });
    }

    return NextResponse.json({ volunteer: mapDbToFormData(data) });
  } catch (error) {
    console.error("volunteer-profile GET: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao carregar cadastro" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const json = (await request.json()) as Partial<VolunteerProfileInput>;
    const parsed = volunteerProfileSchema.safeParse(json);
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
      console.error("volunteer-profile POST: erro ao verificar profile", profileLookupError);
      return NextResponse.json({ error: "Erro ao validar usuário" }, { status: 500 });
    }

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Perfil do usuário não encontrado. Refaça o login ou contate o suporte." },
        { status: 409 },
      );
    }

    const { data: existingVolunteer, error: currentVolunteerError } = await supabaseAdmin
      .from("volunteers")
      .select(
        "id, owner_profile_id, name, telefone, profissao, faixa_etaria, genero, escolaridade, estado, cidade, disponibilidade, periodo, experiencia, atuacao, descricao, comentarios, is_public, accept_terms",
      )
      .eq("owner_profile_id", user.id)
      .limit(1)
      .maybeSingle();

    if (currentVolunteerError) {
      const isUnknownColumn = currentVolunteerError.code === "42703";
      if (!isUnknownColumn) {
        console.error(
          "volunteer-profile POST: erro ao consultar cadastro existente",
          currentVolunteerError,
        );
        return NextResponse.json({ error: "Erro ao consultar cadastro" }, { status: 500 });
      }
    }

    const payload = mapVolunteerProfileToDb(user.id, parsed.data);

    const normalizedCurrentVolunteer = existingVolunteer
      ? {
          ...existingVolunteer,
          comentarios: existingVolunteer.comentarios ?? null,
        }
      : null;

    if (normalizedCurrentVolunteer && !hasChanges(normalizedCurrentVolunteer, payload)) {
      return NextResponse.json({
        ok: true,
        volunteer: mapDbToFormData(normalizedCurrentVolunteer),
      });
    }

    // Se já existe um cadastro, faz UPDATE, senão faz INSERT
    let data: Record<string, unknown> | null = null;
    let error: unknown = null;

    if (existingVolunteer) {
      // UPDATE - atualiza o registro existente
      const updateResult = await supabaseAdmin
        .from("volunteers")
        .update(payload)
        .eq("id", existingVolunteer.id)
        .select(
          "id, owner_profile_id, name, telefone, profissao, faixa_etaria, genero, escolaridade, estado, cidade, disponibilidade, periodo, experiencia, atuacao, descricao, comentarios, is_public, accept_terms",
        )
        .maybeSingle();

      data = updateResult.data;
      error = updateResult.error;
    } else {
      // INSERT - cria novo registro
      const insertResult = await supabaseAdmin
        .from("volunteers")
        .insert(payload)
        .select(
          "id, owner_profile_id, name, telefone, profissao, faixa_etaria, genero, escolaridade, estado, cidade, disponibilidade, periodo, experiencia, atuacao, descricao, comentarios, is_public, accept_terms",
        )
        .maybeSingle();

      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error("volunteer-profile POST: erro ao salvar volunteers", error);
      return NextResponse.json({ error: "Erro ao salvar cadastro" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      volunteer: data ? mapDbToFormData(data) : null,
    });
  } catch (error) {
    console.error("volunteer-profile POST: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao salvar cadastro" }, { status: 500 });
  }
}
