import { getCachedVolunteerProfile } from "@/lib/cache/publicData";
import type { VolunteerProfile } from "@/types/volunteer.types";

export async function getVolunteerProfileBySlug(slug: string): Promise<VolunteerProfile | null> {
  return getCachedVolunteerProfile(slug);
}
