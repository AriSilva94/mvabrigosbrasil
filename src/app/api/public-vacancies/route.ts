import { NextResponse } from "next/server";
import { getVacancyCards } from "@/services/publicDataService";

export async function GET() {
  try {
    const vacancies = await getVacancyCards();
    return NextResponse.json({ vacancies });
  } catch (error) {
    console.error("API /api/public-vacancies - unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar vagas" },
      { status: 500 }
    );
  }
}
