import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function POST(
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

  // 2. Buscar volunteer_id do usuário logado
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: volunteer, error: volunteerError } = await supabaseAdmin
    .from("volunteers")
    .select("id")
    .eq("owner_profile_id", user.id)
    .maybeSingle();

  if (volunteerError || !volunteer) {
    return NextResponse.json(
      { error: "Perfil de voluntário não encontrado" },
      { status: 404 }
    );
  }

  // 3. Verificar se vaga existe e está ativa
  const { data: vacancy, error: vacancyError } = await supabaseAdmin
    .from("vacancies")
    .select("id, title, status, is_published")
    .eq("id", vacancyId)
    .maybeSingle();

  if (vacancyError || !vacancy) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }

  if (vacancy.status !== "active" || !vacancy.is_published) {
    return NextResponse.json(
      { error: "Vaga não está disponível para candidaturas" },
      { status: 400 }
    );
  }

  // 4. Criar candidatura (UNIQUE constraint evita duplicatas)
  const { data: application, error: insertError } = await supabaseAdmin
    .from("vacancy_applications")
    .insert({
      vacancy_id: vacancyId,
      volunteer_id: volunteer.id,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    // Código 23505 = violação de UNIQUE constraint (já se candidatou)
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Você já se candidatou a esta vaga" },
        { status: 409 }
      );
    }
    console.error("Error creating application:", insertError);
    return NextResponse.json(
      { error: "Erro ao criar candidatura" },
      { status: 500 }
    );
  }

  return NextResponse.json({ application, success: true });
}
