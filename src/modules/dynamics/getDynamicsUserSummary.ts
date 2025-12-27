import { SHELTER_TYPE_OPTIONS } from "@/constants/shelterProfile";
import type { PopulationUserSummary } from "@/app/(protected)/dinamica-populacional/types";
import { findProfileById } from "@/modules/auth/repositories/profileRepository";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

type GetDynamicsUserSummaryParams = {
  userId: string;
  fallbackEmail: string | null;
};

export async function getDynamicsUserSummary({
  userId,
  fallbackEmail,
}: GetDynamicsUserSummaryParams): Promise<{
  summary: PopulationUserSummary;
  shelterId: string | null;
}> {
  const supabaseAdmin = getSupabaseAdminClient();

  const { profile } = await findProfileById(supabaseAdmin, userId);

  const { data: shelterRow, error: shelterError } = await supabaseAdmin
    .from("shelters")
    .select("id, name, shelter_type, initial_dogs, initial_cats")
    .eq("profile_id", userId)
    .limit(1)
    .maybeSingle();

  if (shelterError && shelterError.code !== "42703") {
    console.error(
      "dinamica-populacional: erro ao buscar abrigo do usuário",
      shelterError,
    );
  }

  const hasDogs = typeof shelterRow?.initial_dogs === "number";
  const hasCats = typeof shelterRow?.initial_cats === "number";
  const totalAnimals =
    hasDogs || hasCats
      ? (shelterRow?.initial_dogs ?? 0) + (shelterRow?.initial_cats ?? 0)
      : null;

  const shelterTypeLabel =
    SHELTER_TYPE_OPTIONS.find(
      (option) => option.value === shelterRow?.shelter_type,
    )?.label ?? null;

  const summary: PopulationUserSummary = {
    displayName: profile?.full_name || profile?.email || fallbackEmail || null,
    totalAnimals,
    shelterTypeLabel,
    dogsCount: hasDogs ? shelterRow?.initial_dogs ?? 0 : null,
    catsCount: hasCats ? shelterRow?.initial_cats ?? 0 : null,
  };

  return { summary, shelterId: shelterRow?.id ?? null };
}
