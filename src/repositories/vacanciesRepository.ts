import { unstable_cache } from "next/cache";
import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VacancyCard } from "@/types/vacancy.types";
import { normalizePeriod, normalizeWorkload } from "@/constants/vacancyFilters";
import { CACHE_TAGS, CACHE_TIMES } from "@/lib/cache/tags";

type VacancyRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  status: string | null;
  periodo: string | null;
  carga_horaria: string | null;
  cidade: string | null;
  estado: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

async function fetchVacancyCardsUncached(
  supabase: SupabaseClientType
): Promise<{ vacancies: VacancyCard[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("vacancies")
      .select("id, title, slug, description, status, periodo, carga_horaria, cidade, estado, is_published, created_at, updated_at")
      .eq("status", "active")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("vacanciesRepository.fetchVacancyCards - error:", error);
      return { vacancies: [], error };
    }

    const vacancies: VacancyCard[] = (data ?? []).map((vacancy: VacancyRow) => {
      const city = vacancy.cidade?.trim();
      const state = vacancy.estado?.trim();
      const slugFromDb = typeof vacancy.slug === 'string' ? vacancy.slug : String(vacancy.id);

      return {
        id: vacancy.id,
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

/**
 * Busca lista pública de vagas com cache de 10 minutos
 *
 * Cache: 10 minutos
 * Tag: vacancies-public
 * Invalidação: ao criar/editar/deletar vaga
 */
export async function fetchVacancyCards(
  supabase: SupabaseClientType
): Promise<{ vacancies: VacancyCard[]; error: Error | null }> {
  return unstable_cache(
    async () => fetchVacancyCardsUncached(supabase),
    ['vacancies-public'],
    {
      revalidate: CACHE_TIMES.SHORT, // 10 minutos
      tags: [CACHE_TAGS.VACANCIES_PUBLIC],
    }
  )();
}
