import type { Database, SupabaseClientType } from "@/lib/supabase/types";
import type { VacancyCard } from "@/types/vacancy.types";
import { normalizePeriod, normalizeWorkload } from "@/constants/vacancyFilters";

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

export async function fetchVacancyCards(
  supabase: SupabaseClientType
): Promise<{ vacancies: VacancyCard[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("vacancies")
      .select("id, title, slug, description, status, wp_post_id, periodo, carga_horaria, cidade, estado, is_published, created_at, updated_at")
      .eq("status", "active")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("vacanciesRepository.fetchVacancyCards - error:", error);
      return { vacancies: [], error };
    }

    const rows = (data ?? []) as VacancyRow[];
    const vacancies: VacancyCard[] = rows.map((vacancy) => {
      const city = vacancy.cidade?.trim();
      const state = vacancy.estado?.trim();
      const slugFromDb = typeof vacancy.slug === "string" ? vacancy.slug : String(vacancy.id);

      return {
        id: String(vacancy.wp_post_id || vacancy.id),
        title: vacancy.title ?? "Vaga",
        slug: slugFromDb,
        period: normalizePeriod(vacancy.periodo) || undefined,
        workload: normalizeWorkload(vacancy.carga_horaria) || undefined,
        location:
          city && state ? `${city} - ${state}` : city || state || undefined,
      };
    });

    return { vacancies, error: null };
  } catch (error) {
    console.error("vacanciesRepository.fetchVacancyCards - unexpected error:", error);
    return { vacancies: [], error: error as Error };
  }
}
