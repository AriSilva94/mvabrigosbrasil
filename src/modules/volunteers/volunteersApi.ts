import { apiClient } from "@/lib/api/client";
import type { VolunteerProfileInput } from "@/modules/volunteer/volunteerProfileSchema";
import {
  parseVolunteerCards,
  parseVolunteerProfileResponse,
} from "./volunteersContract";

export async function getMyVolunteerProfile(signal?: AbortSignal) {
  return parseVolunteerProfileResponse(
    await apiClient<unknown>("/volunteers/me", { signal }),
  );
}

export async function getPublicVolunteerCards(signal?: AbortSignal) {
  return parseVolunteerCards(
    await apiClient<unknown>("/volunteers", { signal }),
  );
}

export async function saveMyVolunteerProfile(payload: VolunteerProfileInput) {
  return apiClient("/volunteers/me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
