import { z } from "zod";

import { apiClient } from "@/lib/api/client";

const shelterSchema = z.object({
  id: z.string(),
  name: z.string(),
  wp_post_id: z.number().nullable(),
});

const managerSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  wp_user_id: z.number().nullable(),
  created_at: z.string(),
  shelters: z.array(shelterSchema),
});

export type AdminShelter = z.infer<typeof shelterSchema>;
export type AdminManager = z.infer<typeof managerSchema>;

function parseManagers(value: unknown): AdminManager[] {
  const result = z.object({ managers: z.array(managerSchema) }).safeParse(value);
  if (!result.success) {
    throw new TypeError("Resposta inválida ao carregar gerentes.", { cause: result.error });
  }
  return result.data.managers;
}

export function parseAdminShelters(value: unknown): AdminShelter[] {
  const result = z.object({ shelters: z.array(shelterSchema) }).safeParse(value);
  if (!result.success) {
    throw new TypeError("Resposta inválida ao carregar abrigos.", { cause: result.error });
  }
  return result.data.shelters;
}

export async function getAdminManagers(signal?: AbortSignal) {
  return parseManagers(await apiClient<unknown>("/admin/managers", { signal }));
}

export async function getAdminShelters(signal?: AbortSignal) {
  return parseAdminShelters(await apiClient<unknown>("/shelters", { signal }));
}

export async function assignManagerShelters(managerId: string, shelterIds: string[]) {
  return apiClient<{ success: true }>(
    `/admin/managers/${encodeURIComponent(managerId)}/shelters`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelter_ids: shelterIds }),
    },
  );
}
