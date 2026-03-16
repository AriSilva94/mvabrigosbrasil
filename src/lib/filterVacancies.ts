import type { VacancyCard } from "@/types/vacancy.types";
import { normalizeWorkload } from "@/app/(protected)/minhas-vagas/constants";

export interface VacancyFilterOptions {
  stateFilter: string;
  periodFilter: string;
  workloadFilter: string;
}

export function filterVacancies(
  vacancies: VacancyCard[],
  { stateFilter, periodFilter, workloadFilter }: VacancyFilterOptions
): VacancyCard[] {
  return vacancies.filter((vacancy) => {
    const matchesState =
      !stateFilter ||
      vacancy.location?.toLowerCase().includes(stateFilter.toLowerCase());

    const matchesPeriod =
      !periodFilter ||
      vacancy.period?.toLowerCase() === periodFilter.toLowerCase();

    const matchesWorkload =
      !workloadFilter ||
      normalizeWorkload(vacancy.workload).toLowerCase() === workloadFilter.toLowerCase();

    return matchesState && matchesPeriod && matchesWorkload;
  });
}
