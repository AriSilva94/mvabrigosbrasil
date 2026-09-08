import {
  fetchVolunteerCardsFromSupabase,
  fetchVolunteerProfileBySlugFromSupabase,
} from "@/services/volunteersAggregator";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import type { VacancyCard } from "@/types/vacancy.types";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { parsePublicVacancies, parsePublicVacancy } from "@/modules/vacancies/vacanciesApi";

async function getAdminClient(): Promise<SupabaseClientType> {
  return getSupabaseAdminClient();
}

export async function getVolunteerCards(): Promise<VolunteerCard[]> {
  const supabase = await getAdminClient();
  const { volunteers, error } = await fetchVolunteerCardsFromSupabase(supabase);

  if (error) {
    console.error("getVolunteerCards: error", error);
  }

  return volunteers ?? [];
}

export async function getVolunteerProfile(slug: string): Promise<VolunteerProfile | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return null;

  const supabase = await getAdminClient();
  const { profile, error } = await fetchVolunteerProfileBySlugFromSupabase(
    supabase,
    normalizedSlug,
  );

  if (error) {
    console.error("getVolunteerProfile: error", error);
  }

  return profile ?? null;
}

export async function getVacancyCardsOrThrow(): Promise<VacancyCard[]> {
  return parsePublicVacancies(await serverApi<unknown>("/public/vacancies"));
}

export async function getVacancyCards(): Promise<VacancyCard[]> {
  try {
    return await getVacancyCardsOrThrow();
  } catch (error) {
    console.error("getVacancyCards: error", error);
    return [];
  }
}

export async function getPublicVacancyBySlug(slug: string): Promise<UiVacancy | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return null;

  try {
    return parsePublicVacancy(
      await serverApi<unknown>(`/public/vacancies/${encodeURIComponent(normalizedSlug)}`),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
