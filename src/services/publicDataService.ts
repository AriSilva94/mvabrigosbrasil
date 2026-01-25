import {
  fetchVolunteerCardsFromSupabase,
  fetchVolunteerProfileBySlugFromSupabase,
} from "@/services/volunteersAggregator";
import { fetchVacancyCards } from "@/repositories/vacanciesRepository";
import { extractVacancyIdFromSlug, mapVacancyRow } from "@/services/vacanciesSupabase";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { SupabaseClientType, Database } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import type { VacancyCard } from "@/types/vacancy.types";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

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

export async function getVacancyCards(): Promise<VacancyCard[]> {
  const supabase = await getAdminClient();
  const { vacancies, error } = await fetchVacancyCards(supabase);

  if (error) {
    console.error("getVacancyCards: error", error);
  }

  return vacancies ?? [];
}

export async function getPublicVacancyBySlug(slug: string): Promise<UiVacancy | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return null;

  const supabase = await getAdminClient();

  const baseQuery = supabase
    .from("vacancies")
    .select("*")
    .eq("status", "active")
    .eq("is_published", true);

  const bySlug = await baseQuery.eq("slug", normalizedSlug).limit(1).maybeSingle();

  if (bySlug.error) {
    console.error("getPublicVacancyBySlug: slug error", bySlug.error);
  }

  let row = bySlug.data as VacancyRow | null;

  if (!row) {
    const uuidFromSlug = extractVacancyIdFromSlug(normalizedSlug);
    if (uuidFromSlug) {
      const byId = await baseQuery.eq("id", uuidFromSlug).limit(1).maybeSingle();
      if (byId.error) {
        console.error("getPublicVacancyBySlug: id error", byId.error);
      }
      row = byId.data as VacancyRow | null;
    }
  }

  if (!row) return null;

  return { ...mapVacancyRow(row), source: "supabase" };
}
