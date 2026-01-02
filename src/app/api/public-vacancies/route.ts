import { NextResponse } from "next/server";
import { getCachedVacancyCards } from "@/lib/cache/publicData";

export async function GET() {
  try {
    const vacancies = await getCachedVacancyCards();
    return NextResponse.json({ vacancies });
  } catch (error) {
    console.error("API /api/public-vacancies - unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar vagas" },
      { status: 500 }
    );
  }
}
