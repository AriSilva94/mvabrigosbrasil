import { NextResponse } from "next/server";
import { z } from "zod";

import { loadUserAccess } from "@/lib/auth/teamAccess";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { registerSchema } from "@/app/(protected)/dinamica-populacional/validations";
import { deleteDynamicsRecord, fetchDynamicsDisplays, saveDynamicsRecord } from "@/services/dynamicsService";

const submitSchema = registerSchema.extend({
  dynamicType: z.enum(["dinamica", "dinamica_lar"]),
});
const deleteSchema = z.object({
  id: z.string().min(1),
});

const DYNAMICS_SHELTER_SELECT_BASE = "id, initial_dogs, initial_cats";
const DYNAMICS_SHELTER_SELECT_WITH_LT =
  "id, initial_dogs, initial_cats, initial_dogs_lt, initial_cats_lt";

async function resolveShelter(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  access: Awaited<ReturnType<typeof loadUserAccess>>,
  shelterWpPostId?: number | null,
) {
  const queryWithFallback = async (column: "wp_post_id" | "profile_id", value: number | string) => {
    const withLt = await supabaseAdmin
      .from("shelters")
      .select(DYNAMICS_SHELTER_SELECT_WITH_LT)
      .eq(column, value)
      .limit(1)
      .maybeSingle();

    if (!withLt.error) return withLt.data;
    if (withLt.error.code !== "42703") {
      console.error("api/dynamics: erro ao buscar shelter", withLt.error);
      throw withLt.error;
    }

    const withoutLt = await supabaseAdmin
      .from("shelters")
      .select(DYNAMICS_SHELTER_SELECT_BASE)
      .eq(column, value)
      .limit(1)
      .maybeSingle();

    if (withoutLt.error) {
      console.error("api/dynamics: erro ao buscar shelter", withoutLt.error);
      throw withoutLt.error;
    }

    return withoutLt.data;
  };

  // Se shelterWpPostId foi fornecido (gerente visualizando abrigo específico)
  if (shelterWpPostId) {
    return queryWithFallback("wp_post_id", shelterWpPostId);
  }

  // Lógica original: buscar por profile_id
  const attemptOrder = [
    access?.userId ?? null,
    access?.isTeamOnly ? access?.creatorProfileId ?? null : null,
  ].filter(Boolean) as string[];

  for (const profileId of attemptOrder) {
    const data = await queryWithFallback("profile_id", profileId);
    if (data) return data;
  }

  return null;
}

function buildPopulationSummary(shelter: {
  initial_dogs: number | null;
  initial_cats: number | null;
  initial_dogs_lt?: number | null;
  initial_cats_lt?: number | null;
}) {
  const shelterPopulationInitial =
    typeof shelter.initial_dogs === "number" &&
    typeof shelter.initial_cats === "number"
      ? (shelter.initial_dogs ?? 0) + (shelter.initial_cats ?? 0)
      : null;

  const ltPopulationInitial =
    typeof shelter.initial_dogs_lt === "number" &&
    typeof shelter.initial_cats_lt === "number"
      ? (shelter.initial_dogs_lt ?? 0) + (shelter.initial_cats_lt ?? 0)
      : null;

  return {
    shelterPopulationInitial,
    shelterPopulationInitialDogs: shelter.initial_dogs ?? null,
    shelterPopulationInitialCats: shelter.initial_cats ?? null,
    ltPopulationInitial,
    ltPopulationInitialDogs: shelter.initial_dogs_lt ?? null,
    ltPopulationInitialCats: shelter.initial_cats_lt ?? null,
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const access = await loadUserAccess();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Extrair shelter_id da URL se fornecido (para gerentes)
  const { searchParams } = new URL(request.url);
  const shelterIdParam = searchParams.get("shelter_id");
  const shelterWpPostId = shelterIdParam ? parseInt(shelterIdParam, 10) : null;

  const supabaseAdmin = getSupabaseAdminClient();
  const shelter = await resolveShelter(supabaseAdmin, access, shelterWpPostId);

  if (!shelter) {
    return NextResponse.json({ sections: [] });
  }

  const sections = await fetchDynamicsDisplays({
    supabaseAdmin,
    shelterId: shelter.id,
    ...buildPopulationSummary(shelter),
  });

  return NextResponse.json({ sections });
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await loadUserAccess();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.flatten((issue) => issue.message);
    return NextResponse.json(
      { error: "invalid_payload", details },
      { status: 400 },
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const shelter = await resolveShelter(supabaseAdmin, access);

  if (!shelter) {
    return NextResponse.json({ error: "shelter_not_found" }, { status: 404 });
  }

  try {
    await saveDynamicsRecord({
      supabaseAdmin,
      shelterId: shelter.id,
      payload: parsed.data,
    });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  const sections = await fetchDynamicsDisplays({
    supabaseAdmin,
    shelterId: shelter.id,
    ...buildPopulationSummary(shelter),
  });

  return NextResponse.json({ sections });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const access = await loadUserAccess();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.flatten((issue) => issue.message);
    return NextResponse.json(
      { error: "invalid_payload", details },
      { status: 400 },
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const shelter = await resolveShelter(supabaseAdmin, access);

  if (!shelter) {
    return NextResponse.json({ error: "shelter_not_found" }, { status: 404 });
  }

  try {
    await deleteDynamicsRecord({
      supabaseAdmin,
      shelterId: shelter.id,
      rowId: parsed.data.id,
    });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  const sections = await fetchDynamicsDisplays({
    supabaseAdmin,
    shelterId: shelter.id,
    ...buildPopulationSummary(shelter),
  });

  return NextResponse.json({ sections });
}
