import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: shelters, error } = await supabaseAdmin
      .from("shelters")
      .select("id, name, wp_post_id")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar abrigos:", error);
      return NextResponse.json({ error: "Erro ao buscar abrigos" }, { status: 500 });
    }

    return NextResponse.json({ shelters: shelters || [] });

  } catch (error) {
    console.error("Erro na API de abrigos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
