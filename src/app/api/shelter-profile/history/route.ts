import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { ShelterHistoryRecord } from "@/types/shelter.types";

async function getUserId(): Promise<string | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Parse query params (limit, offset)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const supabaseAdmin = getSupabaseAdminClient();

    // Busca o ID do shelter do usuário
    const { data: shelter, error: shelterError } = await supabaseAdmin
      .from("shelters")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();

    if (shelterError) {
      console.error("history GET: erro ao buscar shelter", shelterError);
      return NextResponse.json({ error: "Erro ao buscar cadastro" }, { status: 500 });
    }

    if (!shelter) {
      return NextResponse.json({ history: [] });
    }

    // Busca o histórico
    const { data, error, count } = await supabaseAdmin
      .from("shelter_history")
      .select(
        "id, shelter_id, profile_id, operation, old_data, new_data, changed_fields, changed_at, changed_by",
        { count: "exact" },
      )
      .eq("shelter_id", shelter.id)
      .order("changed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("history GET: erro ao consultar histórico", error);
      return NextResponse.json({ error: "Erro ao consultar histórico" }, { status: 500 });
    }

    return NextResponse.json({
      history: data as ShelterHistoryRecord[],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("history GET: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao carregar histórico" }, { status: 500 });
  }
}
