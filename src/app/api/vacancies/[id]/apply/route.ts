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

  // 3. Verificar se vaga existe, está ativa e buscar shelter_id
  const { data: vacancy, error: vacancyError } = await supabaseAdmin
    .from("vacancies")
    .select("id, title, status, is_published, shelter_id")
    .eq("id", vacancyId)
    .maybeSingle();

  if (vacancyError || !vacancy) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }

  if (vacancy.status !== "active" || !vacancy.is_published || !vacancy.shelter_id) {
    return NextResponse.json(
      { error: "Vaga não está disponível para candidaturas" },
      { status: 400 }
    );
  }

  const shelterId = vacancy.shelter_id;

  // 4. Buscar profile_id do dono do abrigo
  const { data: shelter } = await supabaseAdmin
    .from("shelters")
    .select("profile_id")
    .eq("id", shelterId)
    .maybeSingle();

  if (!shelter?.profile_id) {
    return NextResponse.json(
      { error: "Abrigo não encontrado" },
      { status: 404 }
    );
  }

  // 5. Criar candidatura (UNIQUE constraint evita duplicatas)
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
      const { data: existingThread } = await supabaseAdmin
        .from("chat_threads")
        .select("id")
        .eq("vacancy_id", vacancyId)
        .eq("volunteer_profile_id", user.id)
        .maybeSingle();

      return NextResponse.json(
        {
          error: "Você já se candidatou a esta vaga",
          thread_id: existingThread?.id || null,
        },
        { status: 409 }
      );
    }
    console.error("Error creating application:", insertError);
    return NextResponse.json(
      { error: "Erro ao criar candidatura" },
      { status: 500 }
    );
  }

  // 6. Criar ou reutilizar thread de chat (idempotente via UNIQUE constraint)
  let threadId: string | null = null;

  const { data: existingThread } = await supabaseAdmin
    .from("chat_threads")
    .select("id")
    .eq("vacancy_id", vacancyId)
    .eq("volunteer_profile_id", user.id)
    .maybeSingle();

  if (existingThread) {
    threadId = existingThread.id;
  } else {
    const { data: newThread, error: threadError } = await supabaseAdmin
      .from("chat_threads")
      .insert({
        vacancy_id: vacancyId,
        volunteer_profile_id: user.id,
        shelter_profile_id: shelter.profile_id,
        shelter_id: shelterId,
        volunteer_id: volunteer.id,
        application_id: application.id,
      })
      .select("id")
      .single();

    if (threadError) {
      console.error("Error creating thread:", threadError);
      return NextResponse.json({ application, thread_id: null, success: true });
    }

    threadId = newThread.id;

    // 7. Criar participantes
    await supabaseAdmin.from("chat_participants").insert([
      { thread_id: threadId, profile_id: user.id, role: "volunteer" },
      { thread_id: threadId, profile_id: shelter.profile_id, role: "shelter" },
    ]);

    // 8. Mensagem de sistema automática
    await supabaseAdmin.from("chat_messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      content: `Candidatura enviada para a vaga "${vacancy.title}". Vocês já podem trocar mensagens!`,
      message_type: "system",
    });
  }

  return NextResponse.json({ application, thread_id: threadId, success: true });
}
