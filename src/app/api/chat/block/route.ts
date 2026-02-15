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
  const blockedId = typeof body.blocked_id === "string" ? body.blocked_id : "";
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : null;

  if (!blockedId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (blockedId === user.id) {
    return NextResponse.json({ error: "Não pode bloquear a si mesmo" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin
    .from("chat_blocks")
    .insert({
      blocker_id: user.id,
      blocked_id: blockedId,
      reason,
    });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Usuário já bloqueado" }, { status: 409 });
    }
    console.error("Error blocking user:", error);
    return NextResponse.json({ error: "Erro ao bloquear" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
