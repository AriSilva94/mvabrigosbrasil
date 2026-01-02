import { NextResponse } from "next/server";
import { getCachedVolunteerCards } from "@/lib/cache/publicData";

export async function GET() {
  try {
    const volunteers = await getCachedVolunteerCards();
    return NextResponse.json({ volunteers });
  } catch (error) {
    console.error("API /api/volunteers - unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao buscar voluntários" },
      { status: 500 }
    );
  }
}
