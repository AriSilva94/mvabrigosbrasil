import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function POST(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await context.params;

  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // Buscar o created_at da última mensagem da thread para garantir
  // que o last_read_at cobre todas as mensagens existentes.
  // Isso elimina problemas de clock drift entre JS e PostgreSQL.
  const { data: lastMsg } = await supabaseAdmin
    .from("chat_messages")
    .select("created_at")
    .eq("thread_id", threadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Usar o maior entre: timestamp da última mensagem e agora (JS).
  // Se não há mensagens, usar agora.
  const now = new Date().toISOString();
  const readAt = lastMsg?.created_at && lastMsg.created_at > now
    ? lastMsg.created_at
    : now;

  const { error } = await supabaseAdmin
    .from("chat_participants")
    .update({ last_read_at: readAt })
    .eq("thread_id", threadId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json({ error: "Erro ao marcar como lido" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
