import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Retorna um mapa { vacancy_id: thread_id } com as threads
 * onde o usuário é participante (voluntário com conversa ativa).
 */
export async function fetchVolunteerThreadMap(
  supabase: SupabaseClient,
  userId: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, vacancy_id")
    .eq("volunteer_profile_id", userId)
    .eq("status", "active");

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.vacancy_id) {
      map[row.vacancy_id] = row.id;
    }
  }
  return map;
}
