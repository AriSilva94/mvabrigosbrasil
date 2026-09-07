import "server-only";

import { serverApi } from "@/lib/api/server";

export type ManagerShelter = {
  id: string;
  name: string;
  wp_post_id: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isManagerShelter(value: unknown): value is ManagerShelter {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.wp_post_id === "number" &&
    Number.isSafeInteger(value.wp_post_id) &&
    value.wp_post_id !== 0
  );
}

export function mapManagerShelters(response: unknown): ManagerShelter[] {
  if (!isRecord(response) || !Array.isArray(response.shelters)) {
    throw new TypeError("Resposta inválida ao carregar abrigos do gerente.");
  }

  return response.shelters.filter(isManagerShelter);
}

export async function loadManagerShelters(): Promise<ManagerShelter[]> {
  const response = await serverApi<unknown>("/admin/managers/me/shelters");
  return mapManagerShelters(response);
}
