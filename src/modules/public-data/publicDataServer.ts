import "server-only";

import { publicServerApi } from "@/lib/api/publicServer";
import { parseDatabaseDataset } from "./publicData";

export async function loadPublicDatabaseDataset() {
  const value = await publicServerApi<unknown>(
    "/public/database-dataset",
    { next: { revalidate: 900 } },
  );
  return parseDatabaseDataset(value);
}
