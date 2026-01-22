import { getVolunteerProfile } from "@/services/publicDataService";
import type { VolunteerProfile } from "@/types/volunteer.types";

export async function getVolunteerProfileBySlug(slug: string): Promise<VolunteerProfile | null> {
  return getVolunteerProfile(slug);
}
