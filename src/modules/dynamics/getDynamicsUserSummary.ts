import { SHELTER_TYPE_OPTIONS } from "@/constants/shelterProfile";
import type { PopulationUserSummary } from "@/app/(protected)/dinamica-populacional/types";
import { findProfileById } from "@/modules/auth/repositories/profileRepository";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

type GetDynamicsUserSummaryParams = {
  userId: string;
  fallbackEmail: string | null;
  creatorProfileId?: string | null;
  isTeamOnly?: boolean;
  shelterWpPostId?: number | null;
};

export async function getDynamicsUserSummary({
  userId,
  fallbackEmail,
  creatorProfileId,
  isTeamOnly,
  shelterWpPostId,
}: GetDynamicsUserSummaryParams): Promise<{
  summary: PopulationUserSummary;
  shelterId: string | null;
}> {
  const supabaseAdmin = getSupabaseAdminClient();

  const { profile } = await findProfileById(supabaseAdmin, userId);

  let shelterRow: {
    id: string;
    name: string | null;
    shelter_type: string | null;
    initial_dogs: number | null;
    initial_cats: number | null;
  } | null = null;
  let shelterError: unknown = null;

  // Se shelter_id foi passado na URL (gerente visualizando abrigo específico)
  if (shelterWpPostId) {
    const { data, error } = await supabaseAdmin
      .from("shelters")
      .select("id, name, shelter_type, initial_dogs, initial_cats")
      .eq("wp_post_id", shelterWpPostId)
      .limit(1)
      .maybeSingle();

    if (error) {
      shelterError = error;
      console.error("dinamica-populacional: erro ao buscar abrigo por wp_post_id", error);
    } else if (data) {
      shelterRow = data;
    }
  } else {
    // Lógica original: buscar por profile_id
    const resolveShelter = async (profileId: string) =>
      supabaseAdmin
        .from("shelters")
        .select("id, name, shelter_type, initial_dogs, initial_cats")
        .eq("profile_id", profileId)
        .limit(1)
        .maybeSingle();

    const attemptOrder = [
      userId,
      isTeamOnly && creatorProfileId ? creatorProfileId : null,
    ].filter(Boolean) as string[];

    for (const profileId of attemptOrder) {
      const { data, error } = await resolveShelter(profileId);
      if (error) {
        shelterError = error;
        console.error(
          "dinamica-populacional: erro ao buscar abrigo do usuário",
          error,
        );
        break;
      }
      if (data) {
        shelterRow = data;
        break;
      }
    }
  }

  if (shelterError && (shelterError as { code?: string }).code !== "42703") {
    console.error("dinamica-populacional: erro ao buscar abrigo do usuário", shelterError);
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

  // Se foi passado shelterWpPostId, usar o nome do abrigo
  // Caso contrário, usar o nome do perfil do usuário
  const displayName = shelterWpPostId
    ? (shelterRow?.name ?? null)
    : (profile?.full_name || profile?.email || fallbackEmail || null);

  const summary: PopulationUserSummary = {
    displayName,
    totalAnimals,
    shelterTypeLabel,
    dogsCount: hasDogs ? shelterRow?.initial_dogs ?? 0 : null,
    catsCount: hasCats ? shelterRow?.initial_cats ?? 0 : null,
  };

  return { summary, shelterId: shelterRow?.id ?? null };
}
