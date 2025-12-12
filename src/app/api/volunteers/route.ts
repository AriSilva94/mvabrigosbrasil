import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchCombinedVolunteerCards } from "@/services/volunteersAggregator";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { volunteers, error } = await fetchCombinedVolunteerCards(supabase);

    if (error) {
      console.error("API /api/volunteers - error:", error);
      return NextResponse.json(
        { error: "Erro ao buscar voluntários" },
        { status: 500 }
      );
    }

    return NextResponse.json({ volunteers });
  } catch (error) {
    console.error("API /api/volunteers - unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar voluntários" },
      { status: 500 }
    );
  }
}
