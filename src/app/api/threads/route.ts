import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function GET() {
  // 1. Autenticar
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // 2. Buscar threads do usuário
  const { data: threads, error } = await supabaseAdmin
    .from("chat_threads")
    .select(`
      id,
      status,
      updated_at,
      vacancy_id,
      volunteer_profile_id,
      shelter_profile_id,
      shelter_id,
      volunteer_id
    `)
    .or(`volunteer_profile_id.eq.${user.id},shelter_profile_id.eq.${user.id}`)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 });
  }

  if (!threads || threads.length === 0) {
    return NextResponse.json({ threads: [] });
  }

  // 3. Buscar metadados: vagas, nomes, última mensagem, unread count
  const vacancyIds = [...new Set(threads.map(t => t.vacancy_id))];
  const shelterIds = [...new Set(threads.map(t => t.shelter_id))];
  const volunteerIds = [...new Set(threads.map(t => t.volunteer_id))];

  const [vacanciesRes, sheltersRes, volunteersRes] = await Promise.all([
    supabaseAdmin
      .from("vacancies")
      .select("id, title, slug")
      .in("id", vacancyIds),
    supabaseAdmin
      .from("shelters")
      .select("id, name")
      .in("id", shelterIds),
    supabaseAdmin
      .from("volunteers")
      .select("id, name")
      .in("id", volunteerIds),
  ]);

  const vacancyMap = new Map(
    (vacanciesRes.data || []).map(v => [v.id, v])
  );
  const shelterMap = new Map(
    (sheltersRes.data || []).map(s => [s.id, s])
  );
  const volunteerMap = new Map(
    (volunteersRes.data || []).map(v => [v.id, v])
  );

  // 4. Última mensagem e unread count por thread
  const threadsWithMeta = await Promise.all(
    threads.map(async (thread) => {
      const [lastMsgRes, unreadRes] = await Promise.all([
        supabaseAdmin
          .from("chat_messages")
          .select("content, sender_id, created_at, message_type")
          .eq("thread_id", thread.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabaseAdmin
          .rpc("get_chat_unread_count", {
            p_thread_id: thread.id,
            p_profile_id: user.id,
          }),
      ]);

      const vacancy = vacancyMap.get(thread.vacancy_id);
      const shelter = shelterMap.get(thread.shelter_id);
      const vol = volunteerMap.get(thread.volunteer_id);

      const isVolunteer = thread.volunteer_profile_id === user.id;
      const otherName = isVolunteer
        ? shelter?.name || "Abrigo"
        : vol?.name || "Voluntário";

      return {
        id: thread.id,
        status: thread.status,
        updated_at: thread.updated_at,
        vacancy_title: vacancy?.title || "Vaga",
        vacancy_slug: vacancy?.slug || null,
        other_participant_name: otherName,
        last_message: lastMsgRes.data || null,
        unread_count: unreadRes.data || 0,
      };
    })
  );

  return NextResponse.json({ threads: threadsWithMeta });
}
