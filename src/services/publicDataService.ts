import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import type { VacancyCard } from "@/types/vacancy.types";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import { ApiError } from "@/lib/api/errors";
import { publicServerApi } from "@/lib/api/publicServer";
import { parsePublicVacancies, parsePublicVacancy } from "@/modules/vacancies/vacanciesApi";
import { parseVolunteerCards, parseVolunteerProfile } from "@/modules/volunteers/volunteersContract";

export async function getVolunteerCardsOrThrow(): Promise<VolunteerCard[]> {
  return parseVolunteerCards(await publicServerApi<unknown>("/volunteers"));
}

export async function getVolunteerCards(): Promise<VolunteerCard[]> {
  try {
    return await getVolunteerCardsOrThrow();
  } catch (error) {
    console.error("getVolunteerCards: error", error);
    return [];
  }
}

export async function getVolunteerProfile(slug: string): Promise<VolunteerProfile | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return null;

  try {
    return parseVolunteerProfile(
      await publicServerApi<unknown>(`/volunteers/${encodeURIComponent(normalizedSlug)}`),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getVacancyCardsOrThrow(): Promise<VacancyCard[]> {
  return parsePublicVacancies(await publicServerApi<unknown>("/public/vacancies"));
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
      await publicServerApi<unknown>(`/public/vacancies/${encodeURIComponent(normalizedSlug)}`),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
