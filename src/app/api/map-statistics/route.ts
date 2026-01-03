import { NextResponse } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";

export interface MapStatistics {
  byState: {
    state: string;
    count: number;
  }[];
  byType: {
    total: number;
    public: number;
    private: number;
    mixed: number;
    temporary: number;
  };
}

export async function GET() {
  try {
    const supabase = await getServerSupabaseClient({ readOnly: true });

    // Buscar contagem de abrigos ativos por estado
    const { data: shelters, error: sheltersError } = await supabase
      .from("shelters")
      .select("state, shelter_type")
      .eq("active", true);

    if (sheltersError) {
      console.error("Error fetching shelters:", sheltersError);
      return NextResponse.json(
        { error: "Failed to fetch shelter statistics" },
        { status: 500 }
      );
    }

    // Agregar dados por estado
    const byState = shelters.reduce(
      (acc, shelter) => {
        const state = shelter.state?.toUpperCase();
        if (!state) return acc;

        const existing = acc.find((item) => item.state === state);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ state, count: 1 });
        }
        return acc;
      },
      [] as { state: string; count: number }[]
    );

    // Agregar dados por tipo
    const byType = shelters.reduce(
      (acc, shelter) => {
        acc.total++;
        const type = shelter.shelter_type as keyof Omit<typeof acc, "total">;
        if (type && type in acc) {
          acc[type]++;
        }
        return acc;
      },
      { total: 0, public: 0, private: 0, mixed: 0, temporary: 0 }
    );

    const statistics: MapStatistics = {
      byState,
      byType,
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Unexpected error in map-statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
