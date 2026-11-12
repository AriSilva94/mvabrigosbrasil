import "server-only";

import { publicServerApi } from "@/lib/api/publicServer";
import { parseDatabaseDataset } from "./publicData";

export async function loadPublicDatabaseDataset() {
  const value = await publicServerApi<unknown>(
    "/public/database-dataset",
    // A API já cacheia no Redis e invalida ao salvar; um cache do Next por cima atrasava os dados.
    { cache: "no-store" },
  );
  return parseDatabaseDataset(value);
}
