import { SHELTER_TYPE_OPTIONS } from "@/constants/shelterProfile";
import type { PopulationUserSummary } from "@/app/(protected)/dinamica-populacional/types";
import { findProfileById } from "@/modules/auth/repositories/profileRepository";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { parseTemporaryAgreementValue } from "@/modules/shelter/temporaryAgreement";

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
  const shelterSelectBase =
    "id, name, shelter_type, temporary_agreement, initial_dogs, initial_cats";
  const shelterSelectWithLt =
    "id, name, shelter_type, temporary_agreement, initial_dogs, initial_cats, initial_dogs_lt, initial_cats_lt";

  const { profile } = await findProfileById(supabaseAdmin, userId);

  let shelterRow: {
    id: string;
    name: string | null;
    shelter_type: string | null;
    temporary_agreement?: boolean | string | null;
    initial_dogs: number | null;
    initial_cats: number | null;
    initial_dogs_lt?: number | null;
    initial_cats_lt?: number | null;
  } | null = null;
  let shelterError: unknown = null;

  const resolveShelterQuery = async (
    column: "wp_post_id" | "profile_id",
    value: number | string,
  ) => {
    const withLt = await supabaseAdmin
      .from("shelters")
      .select(shelterSelectWithLt)
      .eq(column, value)
      .limit(1)
      .maybeSingle();

    if (!withLt.error) {
      return { data: withLt.data, error: null };
    }

    if (withLt.error.code !== "42703") {
      return { data: null, error: withLt.error };
    }

    const withoutLt = await supabaseAdmin
      .from("shelters")
      .select(shelterSelectBase)
      .eq(column, value)
      .limit(1)
      .maybeSingle();

    return { data: withoutLt.data, error: withoutLt.error };
  };

  // Se shelter_id foi passado na URL (gerente visualizando abrigo específico)
  if (shelterWpPostId) {
    const { data, error } = await resolveShelterQuery("wp_post_id", shelterWpPostId);

    if (error) {
      shelterError = error;
      console.error("dinamica-populacional: erro ao buscar abrigo por wp_post_id", error);
    } else if (data) {
      shelterRow = data;
    }
  } else {
    // Lógica original: buscar por profile_id
    const attemptOrder = [
      userId,
      isTeamOnly && creatorProfileId ? creatorProfileId : null,
    ].filter(Boolean) as string[];

    for (const profileId of attemptOrder) {
      const { data, error } = await resolveShelterQuery("profile_id", profileId);
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
  const hasDogsLt = typeof shelterRow?.initial_dogs_lt === "number";
  const hasCatsLt = typeof shelterRow?.initial_cats_lt === "number";
  const totalAnimalsLt =
    hasDogsLt || hasCatsLt
      ? (shelterRow?.initial_dogs_lt ?? 0) + (shelterRow?.initial_cats_lt ?? 0)
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
  const hasTemporaryAgreement =
    parseTemporaryAgreementValue(shelterRow?.temporary_agreement) === true;

  const summary: PopulationUserSummary = {
    displayName,
    totalAnimals,
    shelterTypeLabel,
    hasTemporaryAgreement,
    dogsCount: hasDogs ? shelterRow?.initial_dogs ?? 0 : null,
    catsCount: hasCats ? shelterRow?.initial_cats ?? 0 : null,
    totalAnimalsLt,
    dogsCountLt: hasDogsLt ? shelterRow?.initial_dogs_lt ?? 0 : null,
    catsCountLt: hasCatsLt ? shelterRow?.initial_cats_lt ?? 0 : null,
  };

  return { summary, shelterId: shelterRow?.id ?? null };
}
