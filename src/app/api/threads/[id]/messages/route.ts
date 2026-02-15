import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") || 30), 50);

  // 1. Autenticar
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // 2. Verificar participação
  const { data: participant } = await supabaseAdmin
    .from("chat_participants")
    .select("id")
    .eq("thread_id", threadId)
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!participant) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // 3. Buscar mensagens com paginação por cursor
  let query = supabaseAdmin
    .from("chat_messages")
    .select(`
      id,
      sender_id,
      content,
      message_type,
      created_at,
      chat_attachments (id, file_name, mime_type, file_size, storage_path)
    `)
    .eq("thread_id", threadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: messages, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 });
  }

  const hasMore = (messages?.length || 0) > limit;
  const result = (messages || []).slice(0, limit);

  return NextResponse.json({
    messages: result.reverse(),
    has_more: hasMore,
    next_cursor: hasMore ? result[0]?.created_at : null,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await context.params;

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

  // 3. Verificar participação e thread ativa
  const { data: thread } = await supabaseAdmin
    .from("chat_threads")
    .select("id, status, volunteer_profile_id, shelter_profile_id")
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  if (thread.status !== "active") {
    return NextResponse.json({ error: "Conversa encerrada" }, { status: 400 });
  }

  const isParticipant =
    thread.volunteer_profile_id === user.id ||
    thread.shelter_profile_id === user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // 4. Verificar bloqueio
  const otherProfileId = thread.volunteer_profile_id === user.id
    ? thread.shelter_profile_id
    : thread.volunteer_profile_id;

  const { data: blocked } = await supabaseAdmin
    .rpc("is_chat_blocked", { p_user_a: user.id, p_user_b: otherProfileId });

  if (blocked) {
    return NextResponse.json(
      { error: "Não é possível enviar mensagem nesta conversa" },
      { status: 403 }
    );
  }

  // 5. Rate limit: max 30 mensagens por minuto
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("thread_id", threadId)
    .eq("sender_id", user.id)
    .gte("created_at", oneMinuteAgo);

  if ((count || 0) >= 30) {
    return NextResponse.json(
      { error: "Limite de mensagens atingido. Aguarde um momento." },
      { status: 429 }
    );
  }

  // 6. Sanitizar (remover HTML)
  const sanitizedContent = content.replace(/<[^>]*>/g, "").trim();

  if (!sanitizedContent) {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  // 7. Inserir mensagem
  const { data: message, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      content: sanitizedContent,
      message_type: "text",
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }

  return NextResponse.json({ message, success: true });
}
