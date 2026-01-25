import { NextResponse } from "next/server";
import { getVolunteerCards } from "@/services/publicDataService";

export async function GET() {
  try {
    const volunteers = await getVolunteerCards();
    return NextResponse.json({ volunteers });
  } catch (error) {
    console.error("API /api/volunteers - unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar voluntários" },
      { status: 500 }
    );
  }
}
