import "server-only";

import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { parseShelterProfileResponse } from "@/modules/shelter/shelterProfileApi";
import {
  parseApplications,
  parsePublicVacancy,
  parseVacanciesResponse,
  parseVacancyResponse,
  parseVacancyStatus,
} from "./vacanciesApi";

export async function loadOwnerVacanciesPageData() {
  const [shelterRaw, vacanciesRaw] = await Promise.all([
    serverApi<unknown>("/shelters/me"),
    serverApi<unknown>("/vacancies"),
  ]);
  const shelterName = parseShelterProfileResponse(shelterRaw).shelter?.name ?? null;
  const vacancies = parseVacanciesResponse(vacanciesRaw);
  const composed = await Promise.all(vacancies.map(async (vacancy) => ({
    ...vacancy,
    shelter: shelterName ?? undefined,
    applicationsCount: parseApplications(
      await serverApi<unknown>(`/vacancies/${encodeURIComponent(vacancy.id)}/applications`),
    ).length,
  })));
  return { shelterName, vacancies: composed };
}

export async function loadSharedVacancy(slug: string, isAuthenticated: boolean) {
  const encoded = encodeURIComponent(slug);
  const status = parseVacancyStatus(await serverApi<unknown>(`/vacancies/${encoded}/my-status`));
  try {
    const vacancy = status.isOwner
      ? parseVacancyResponse(await serverApi<unknown>(`/vacancies/${encoded}`))
      : parsePublicVacancy(await serverApi<unknown>(`/public/vacancies/${encoded}`));
    return {
      vacancy,
      canEdit: status.isOwner,
      hasApplied: status.hasApplied,
      isAuthenticated,
    };
  } catch (error) {
    if (!status.isOwner && error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function loadCandidatesPageData(slug: string) {
  const encoded = encodeURIComponent(slug);
  const vacancy = parseVacancyResponse(await serverApi<unknown>(`/vacancies/${encoded}`));
  const applications = parseApplications(
    await serverApi<unknown>(`/vacancies/${encoded}/applications`),
  );
  return { vacancy, applications };
}
