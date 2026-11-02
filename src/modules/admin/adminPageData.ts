import "server-only";

import { serverApi } from "@/lib/api/server";
import { parseAdminShelters } from "./adminApi";

export async function loadAdminShelters() {
  return parseAdminShelters(await serverApi<unknown>("/shelters"));
}
