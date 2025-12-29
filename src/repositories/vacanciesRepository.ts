import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VacancyCard } from "@/types/vacancy.types";
import { normalizePeriod, normalizeWorkload } from "@/constants/vacancyFilters";

type VacancyRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  wp_post_id: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type VacancyDescription = {
  post_periodo?: string | null;
  post_carga?: string | null;
  post_cidade?: string | null;
  post_estado?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

export async function fetchVacancyCards(
  supabase: SupabaseClientType
): Promise<{ vacancies: VacancyCard[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("vacancies")
      .select("id, title, slug, description, status, wp_post_id, created_at, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("vacanciesRepository.fetchVacancyCards - error:", error);
      return { vacancies: [], error };
    }

    const vacancies: VacancyCard[] = (data ?? []).map((vacancy) => {
      // Parse description JSON to extract metadata
      let meta: VacancyDescription = {};
      if (vacancy.description) {
        try {
          meta = JSON.parse(vacancy.description) as VacancyDescription;
        } catch (e) {
          console.warn(`Failed to parse description for vacancy ${vacancy.id}:`, e);
        }
      }

      const city = (meta.post_cidade || meta.cidade)?.trim();
      const state = (meta.post_estado || meta.estado)?.trim();
      const slugFromDb = typeof vacancy.slug === 'string' ? vacancy.slug : String(vacancy.id);

      return {
        id: String(vacancy.wp_post_id || vacancy.id),
        title: vacancy.title ?? "Vaga",
        slug: slugFromDb,
        period: normalizePeriod(meta.post_periodo) || undefined,
        workload: normalizeWorkload(meta.post_carga) || undefined,
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
