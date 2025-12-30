import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import type { VacancyProfile } from "@/types/vacancies.types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_PREFIX_REGEX = /^[0-9a-f]{8}$/i;

type VacancyRow = Database["public"]["Tables"]["vacancies"]["Row"];

function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildVacancySlug(title: string, id: string): string {
  const base = slugifyTitle(title || "vaga");
  const idPrefix = id.replace(/-/g, "").slice(0, 8) || "nova";
  return `${base}-${idPrefix}`;
}

export function extractVacancyIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  if (UUID_REGEX.test(slug)) return slug;
  const segments = slug.split("-");
  const maybeId = segments.at(-1) ?? "";
  if (UUID_PREFIX_REGEX.test(maybeId)) return maybeId;
  return null;
}

export function mapVacancyRow(row: VacancyRow): VacancyProfile {
  const title = row.title ?? "Vaga";
  const slug = (typeof row.slug === 'string' ? row.slug : null) || buildVacancySlug(title, row.id);

  return {
    id: row.id,
    title,
    slug,
    city: typeof row.cidade === 'string' ? row.cidade : undefined,
    state: typeof row.estado === 'string' ? row.estado : undefined,
    period: typeof row.periodo === 'string' ? row.periodo : undefined,
    workload: typeof row.carga_horaria === 'string' ? row.carga_horaria : undefined,
    demand: typeof row.tipo_demanda === 'string' ? row.tipo_demanda : undefined,
    area: typeof row.area_atuacao === 'string' ? row.area_atuacao : undefined,
    quantity: typeof row.quantidade === 'string' ? row.quantidade : undefined,
    isPublished: typeof row.is_published === 'boolean' ? row.is_published : undefined,
    shelter: undefined, // Pode ser preenchido com join se necessário
    description: typeof row.description === 'string' ? row.description : undefined,
    skills: typeof row.habilidades_e_funcoes === 'string' ? row.habilidades_e_funcoes : undefined,
    volunteerProfile: typeof row.perfil_dos_voluntarios === 'string' ? row.perfil_dos_voluntarios : undefined,
  };
}

export async function fetchVacanciesByShelter(
  supabaseAdmin: SupabaseClient<Database>,
  shelterId: string
): Promise<{ vacancies: VacancyProfile[]; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from("vacancies")
    .select("*")
    .eq("shelter_id", shelterId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchVacanciesByShelter: erro ao consultar", error);
    return { vacancies: [], error: "Erro ao carregar vagas" };
  }

  const vacancies = (data ?? []).map(row => mapVacancyRow(row as VacancyRow));
  return { vacancies };
}
