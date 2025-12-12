import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { fetchVolunteerProfileBySlugCombined } from "@/services/volunteersAggregator";
import type { VolunteerProfile } from "@/types/volunteer.types";

export async function getVolunteerProfileBySlug(slug: string): Promise<VolunteerProfile | null> {
  const supabase = getSupabaseAdminClient();
  const { profile, error } = await fetchVolunteerProfileBySlugCombined(supabase, slug);

  if (error) {
    console.error("volunteersService.getVolunteerProfileBySlug - error:", error);
    return null;
  }

  return profile;
}
