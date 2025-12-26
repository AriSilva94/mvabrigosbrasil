import { NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import {
  vacancyFormSchema,
  type VacancyFormInput,
} from "@/app/(protected)/minhas-vagas/schema";
import { fetchVacanciesByShelter, mapVacancyRow } from "@/services/vacanciesSupabase";

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

async function getShelterByProfile(profileId: string) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("shelters")
    .select("id, city, state")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("api/vacancies GET shelter error", error);
    return { shelter: null, error: "Erro ao buscar abrigo" };
  }

  return { shelter: data ?? null, error: null };
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { shelter, error } = await getShelterByProfile(userId);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  if (!shelter?.id) {
    return NextResponse.json({ vacancies: [] });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { vacancies, error: fetchError } = await fetchVacanciesByShelter(
    supabaseAdmin,
    shelter.id,
  );

  if (fetchError) {
    return NextResponse.json({ error: fetchError }, { status: 500 });
  }

  const data = vacancies.map((vacancy) => ({ ...vacancy, source: "supabase" }));

  return NextResponse.json({ vacancies: data });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = (await request.json()) as Partial<VacancyFormInput>;
  const parsed = vacancyFormSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Dados inválidos.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { shelter, error } = await getShelterByProfile(userId);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  if (!shelter?.id) {
    return NextResponse.json(
      { error: "Abrigo não encontrado para o usuário." },
      { status: 404 },
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const extras = {
    post_content: parsed.data.post_content,
    post_habilidades_e_funcoes: parsed.data.post_habilidades_e_funcoes,
    post_perfil_dos_voluntarios: parsed.data.post_perfil_dos_voluntarios,
    post_periodo: parsed.data.post_periodo,
    post_carga: parsed.data.post_carga,
    post_tipo_demanda: parsed.data.post_tipo_demanda,
    post_area_atuacao: parsed.data.post_area_atuacao,
    post_quantidade: parsed.data.post_quantidade,
  };

  const { data, error: insertError } = await supabaseAdmin
    .from("vacancies")
    .insert({
      shelter_id: shelter.id,
      title: parsed.data.post_title,
      description: JSON.stringify(extras),
      status: "open",
    })
    .select("id, shelter_id, title, description, status, created_at")
    .single();

  if (insertError) {
    console.error("api/vacancies POST insert error", insertError);
    return NextResponse.json({ error: "Erro ao salvar vaga" }, { status: 500 });
  }

  const vacancy = { ...mapVacancyRow(data as any), source: "supabase" };
  return NextResponse.json({ vacancy });
}
