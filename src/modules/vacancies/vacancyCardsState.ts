import type { VacancyCard } from "@/types/vacancy.types";

export type VacancyCardsState = {
  vacancies: VacancyCard[];
  loading: boolean;
  error: Error | null;
};

export function getInitialVacanciesTransition(
  initialVacancies: VacancyCard[],
): VacancyCardsState | null {
  if (initialVacancies.length === 0) return null;
  return { vacancies: initialVacancies, loading: false, error: null };
}
