import { unstable_cache } from "next/cache";

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
import { CACHE_TAGS, DEFAULT_REVALIDATE_SECONDS } from "./tags";

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

async function getAdminClient(): Promise<SupabaseClientType> {
  return getSupabaseAdminClient();
}

const cachedVolunteerCards = unstable_cache(
  async (): Promise<VolunteerCard[]> => {
    const supabase = await getAdminClient();
    const { volunteers, error } = await fetchVolunteerCardsFromSupabase(supabase);

    if (error) {
      console.error("cachedVolunteerCards: error", error);
    }

    return volunteers ?? [];
  },
  ["cache", "volunteers", "cards"],
  {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.volunteers],
  },
);

export async function getCachedVolunteerCards(): Promise<VolunteerCard[]> {
  return cachedVolunteerCards();
}

export function getCachedVolunteerProfile(slug: string): Promise<VolunteerProfile | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return Promise.resolve(null);

  const tags = [CACHE_TAGS.volunteers, CACHE_TAGS.volunteer(normalizedSlug)];

  return unstable_cache(
    async (targetSlug: string): Promise<VolunteerProfile | null> => {
      const supabase = await getAdminClient();
      const { profile, error } = await fetchVolunteerProfileBySlugFromSupabase(
        supabase,
        targetSlug,
      );

      if (error) {
        console.error("getCachedVolunteerProfile: error", error);
      }

      return profile ?? null;
    },
    ["cache", "volunteer", "profile", normalizedSlug],
    {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags,
    },
  )(normalizedSlug);
}

const cachedVacancyCards = unstable_cache(
  async (): Promise<VacancyCard[]> => {
    const supabase = await getAdminClient();
    const { vacancies, error } = await fetchVacancyCards(supabase);

    if (error) {
      console.error("cachedVacancyCards: error", error);
    }

    return vacancies ?? [];
  },
  ["cache", "vacancies", "cards"],
  {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.vacancies],
  },
);

export async function getCachedVacancyCards(): Promise<VacancyCard[]> {
  return cachedVacancyCards();
}

export function getCachedPublicVacancyBySlug(slug: string): Promise<UiVacancy | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return Promise.resolve(null);

  const tags = [CACHE_TAGS.vacancies, CACHE_TAGS.vacancy(normalizedSlug)];

  return unstable_cache(
    async (targetSlug: string): Promise<UiVacancy | null> => {
      const supabase = await getAdminClient();

      const baseQuery = supabase
        .from("vacancies")
        .select("*")
        .eq("status", "active")
        .eq("is_published", true);

      const bySlug = await baseQuery.eq("slug", targetSlug).limit(1).maybeSingle();

      if (bySlug.error) {
        console.error("getCachedPublicVacancyBySlug: slug error", bySlug.error);
      }

      let row = bySlug.data as VacancyRow | null;

      if (!row) {
        const uuidFromSlug = extractVacancyIdFromSlug(targetSlug);
        if (uuidFromSlug) {
          const byId = await baseQuery.eq("id", uuidFromSlug).limit(1).maybeSingle();
          if (byId.error) {
            console.error("getCachedPublicVacancyBySlug: id error", byId.error);
          }
          row = byId.data as VacancyRow | null;
        }
      }

      if (!row) return null;

      return { ...mapVacancyRow(row), source: "supabase" };
    },
    ["cache", "vacancy", "public", normalizedSlug],
    {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags,
    },
  )(normalizedSlug);
}
