import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const reportedUserId = typeof body.reported_user_id === "string" ? body.reported_user_id : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const threadId = typeof body.thread_id === "string" ? body.thread_id : null;
  const messageId = typeof body.message_id === "string" ? body.message_id : null;

  if (!reportedUserId || !reason || reason.length > 1000) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin
    .from("chat_reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason,
      thread_id: threadId,
      message_id: messageId,
    });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Denúncia já registrada" }, { status: 409 });
    }
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Erro ao denunciar" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
