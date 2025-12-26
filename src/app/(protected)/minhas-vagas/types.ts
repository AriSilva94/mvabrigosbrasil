import type { VacancyProfile } from "@/types/vacancies.types";

export type UiVacancy = VacancyProfile & {
  source?: "supabase" | "legacy";
};
