import { NextRequest, NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { Database } from "@/lib/supabase/types";
import {
  vacancyFormSchema,
  type VacancyFormInput,
} from "@/app/(protected)/minhas-vagas/schema";
import { extractVacancyIdFromSlug, mapVacancyRow } from "@/services/vacanciesSupabase";

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

async function getShelterForUser() {
  const userId = await getCurrentUserId();
  if (!userId) return { shelter: null, error: "Não autenticado", status: 401 };

  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("shelters")
    .select("id, city, state")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    console.error("api/vacancies/[id] shelter error", error);
    return { shelter: null, error: "Erro ao buscar abrigo", status: 500 };
  }

  if (!data) return { shelter: null, error: "Abrigo não encontrado", status: 404 };

  return { shelter: data, error: null, status: 200 };
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { shelter, error, status } = await getShelterForUser();
  if (error || !shelter) {
    return NextResponse.json({ error }, { status });
  }

  const uuidFromSlug = UUID_REGEX.test(id) ? id : extractVacancyIdFromSlug(id);

  if (uuidFromSlug) {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error: fetchError } = await supabaseAdmin
      .from("vacancies")
      .select("*")
      .eq("id", uuidFromSlug)
      .eq("shelter_id", shelter.id)
      .maybeSingle();

    if (fetchError) {
      console.error("api/vacancies/[id] GET error", fetchError);
      return NextResponse.json({ error: "Erro ao carregar vaga" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ vacancy: { ...mapVacancyRow(data as VacancyRow), source: "supabase" } });
  }

  return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { shelter, error, status } = await getShelterForUser();
  if (error || !shelter) {
    return NextResponse.json({ error }, { status });
  }

  const json = (await request.json()) as Partial<VacancyFormInput>;
  const parsed = vacancyFormSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Dados inválidos.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // Se for UUID, atualiza vaga existente
  const uuidFromSlug = UUID_REGEX.test(id) ? id : extractVacancyIdFromSlug(id);

  if (uuidFromSlug) {
    const { data, error: updateError } = await supabaseAdmin
      .from("vacancies")
      .update({
        title: parsed.data.post_title,
        description: parsed.data.post_content,
        area_atuacao: parsed.data.post_area_atuacao,
        carga_horaria: parsed.data.post_carga,
        periodo: parsed.data.post_periodo,
        quantidade: parsed.data.post_quantidade,
        is_published: parsed.data.post_is_published,
        habilidades_e_funcoes: parsed.data.post_habilidades_e_funcoes,
        perfil_dos_voluntarios: parsed.data.post_perfil_dos_voluntarios,
        tipo_demanda: parsed.data.post_tipo_demanda,
      })
      .eq("id", uuidFromSlug)
      .eq("shelter_id", shelter.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("api/vacancies/[id] PUT error", updateError);
      return NextResponse.json({ error: "Erro ao atualizar vaga" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ vacancy: { ...mapVacancyRow(data as VacancyRow), source: "supabase" } });
  }

  // Caso seja legado, cria uma nova vaga no Supabase vinculada ao abrigo do usuário
  const { data, error: insertError } = await supabaseAdmin
    .from("vacancies")
    .insert({
      shelter_id: shelter.id,
      title: parsed.data.post_title,
      description: parsed.data.post_content,
      cidade: shelter.city,
      estado: shelter.state,
      area_atuacao: parsed.data.post_area_atuacao,
      carga_horaria: parsed.data.post_carga,
      periodo: parsed.data.post_periodo,
      quantidade: parsed.data.post_quantidade,
      is_published: parsed.data.post_is_published,
      habilidades_e_funcoes: parsed.data.post_habilidades_e_funcoes,
      perfil_dos_voluntarios: parsed.data.post_perfil_dos_voluntarios,
      tipo_demanda: parsed.data.post_tipo_demanda,
      status: "active",
    })
    .select("*")
    .maybeSingle();

  if (insertError) {
    console.error("api/vacancies/[id] PUT insert error (legacy)", insertError);
    return NextResponse.json({ error: "Erro ao salvar vaga" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ vacancy: { ...mapVacancyRow(data as VacancyRow), source: "supabase" } });
}
