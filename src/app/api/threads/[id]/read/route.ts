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

  const { error } = await supabaseAdmin
    .from("chat_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json({ error: "Erro ao marcar como lido" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
