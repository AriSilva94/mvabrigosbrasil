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

async function resolveShelter(supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("shelters")
    .select("id, initial_dogs, initial_cats")
    .eq("profile_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("api/dynamics: erro ao buscar shelter", error);
    throw error;
  }

  return data;
}

export async function GET(): Promise<NextResponse> {
  const access = await loadUserAccess();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const shelter = await resolveShelter(supabaseAdmin, access.userId);

  if (!shelter) {
    return NextResponse.json({ sections: [] });
  }

  const populationInitial =
    typeof shelter.initial_dogs === "number" && typeof shelter.initial_cats === "number"
      ? (shelter.initial_dogs ?? 0) + (shelter.initial_cats ?? 0)
      : null;

  const sections = await fetchDynamicsDisplays({
    supabaseAdmin,
    shelterId: shelter.id,
    populationInitial,
    populationInitialDogs: shelter.initial_dogs ?? null,
    populationInitialCats: shelter.initial_cats ?? null,
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
  const shelter = await resolveShelter(supabaseAdmin, access.userId);

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

  const populationInitial =
    typeof shelter.initial_dogs === "number" && typeof shelter.initial_cats === "number"
      ? (shelter.initial_dogs ?? 0) + (shelter.initial_cats ?? 0)
      : null;

  const sections = await fetchDynamicsDisplays({
    supabaseAdmin,
    shelterId: shelter.id,
    populationInitial,
    populationInitialDogs: shelter.initial_dogs ?? null,
    populationInitialCats: shelter.initial_cats ?? null,
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
  const shelter = await resolveShelter(supabaseAdmin, access.userId);

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

  const populationInitial =
    typeof shelter.initial_dogs === "number" && typeof shelter.initial_cats === "number"
      ? (shelter.initial_dogs ?? 0) + (shelter.initial_cats ?? 0)
      : null;

  const sections = await fetchDynamicsDisplays({
    supabaseAdmin,
    shelterId: shelter.id,
    populationInitial,
    populationInitialDogs: shelter.initial_dogs ?? null,
    populationInitialCats: shelter.initial_cats ?? null,
  });

  return NextResponse.json({ sections });
}
