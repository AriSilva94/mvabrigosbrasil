import type { SupabaseClientType } from "@/lib/supabase/types";
import type { VolunteerCard, VolunteerProfile } from "@/types/volunteer.types";
import {
  fetchVolunteerCardsFromNew,
  fetchVolunteerProfileBySlugFromNew,
} from "@/repositories/newVolunteersRepository";

export async function fetchCombinedVolunteerCards(
  supabase: SupabaseClientType
): Promise<{ volunteers: VolunteerCard[]; error: Error | null }> {
  return fetchVolunteerCardsFromNew(supabase);
}

export async function fetchVolunteerProfileBySlugCombined(
  supabase: SupabaseClientType,
  slug: string
): Promise<{ profile: VolunteerProfile | null; error: Error | null }> {
  return fetchVolunteerProfileBySlugFromNew(supabase, slug);
}
