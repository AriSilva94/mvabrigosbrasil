import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVacancyCards } from "@/repositories/vacanciesRepository";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { vacancies, error } = await fetchVacancyCards(supabase);

    if (error) {
      console.error("API /api/public-vacancies - error:", error);
      return NextResponse.json(
        { error: "Erro ao buscar vagas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ vacancies });
  } catch (error) {
    console.error("API /api/public-vacancies - unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar vagas" },
      { status: 500 }
    );
  }
}
