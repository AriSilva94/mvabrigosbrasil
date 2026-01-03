import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: vacancyId } = await context.params;

  // 1. Autenticar usuário
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 2. Verificar se vaga pertence ao abrigo do usuário
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: shelter } = await supabaseAdmin
    .from("shelters")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!shelter) {
    return NextResponse.json({ error: "Abrigo não encontrado" }, { status: 404 });
  }

  const { data: vacancy } = await supabaseAdmin
    .from("vacancies")
    .select("id, shelter_id")
    .eq("id", vacancyId)
    .eq("shelter_id", shelter.id)
    .maybeSingle();

  if (!vacancy) {
    return NextResponse.json(
      { error: "Vaga não encontrada ou sem permissão" },
      { status: 404 }
    );
  }

  // 3. Buscar candidaturas com dados do voluntário
  const { data: applications, error } = await supabaseAdmin
    .from("vacancy_applications")
    .select(`
      id,
      status,
      applied_at,
      created_at,
      volunteers (
        id,
        name,
        cidade,
        estado,
        telefone,
        profissao,
        experiencia,
        slug
      )
    `)
    .eq("vacancy_id", vacancyId)
    .order("applied_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Erro ao buscar candidaturas" },
      { status: 500 }
    );
  }

  return NextResponse.json({ applications });
}
