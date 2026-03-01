import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { sanitizeTextContent } from "@/lib/utils/sanitize";

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id: threadId, messageId } = await context.params;

  // 1. Autenticar
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 2. Validar body
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content || content.length > 5000) {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // 3. Buscar mensagem original
  const { data: message } = await supabaseAdmin
    .from("chat_messages")
    .select("id, sender_id, thread_id, message_type, deleted_at, created_at")
    .eq("id", messageId)
    .eq("thread_id", threadId)
    .maybeSingle();

  if (!message) {
    return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });
  }

  // 4. Verificar autoria
  if (message.sender_id !== user.id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // 5. Verificar que não está deletada
  if (message.deleted_at) {
    return NextResponse.json({ error: "Mensagem já foi deletada" }, { status: 400 });
  }

  // 6. Verificar tipo (não editar system messages)
  if (message.message_type !== "text") {
    return NextResponse.json({ error: "Não é possível editar esta mensagem" }, { status: 400 });
  }

  // 7. Verificar janela de edição (15 minutos)
  const createdAt = new Date(message.created_at).getTime();
  const now = Date.now();

  if (now - createdAt > EDIT_WINDOW_MS) {
    return NextResponse.json(
      { error: "O tempo para editar esta mensagem expirou" },
      { status: 400 }
    );
  }

  // 8. Sanitizar conteúdo (múltiplas passadas para prevenir bypass)
  const sanitizedContent = sanitizeTextContent(content);

  if (!sanitizedContent) {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  // 9. Atualizar mensagem
  const { data: updated, error } = await supabaseAdmin
    .from("chat_messages")
    .update({
      content: sanitizedContent,
      edited_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    console.error("Error editing message:", error);
    return NextResponse.json({ error: "Erro ao editar mensagem" }, { status: 500 });
  }

  return NextResponse.json({ message: updated, success: true });
}
