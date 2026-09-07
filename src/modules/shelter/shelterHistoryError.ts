import { ApiError } from "@/lib/api/errors";

const HISTORY_ERROR_FALLBACK = "Erro ao carregar histórico";

export function shelterHistoryErrorMessage(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  ) {
    return null;
  }

  return error instanceof ApiError ? error.message : HISTORY_ERROR_FALLBACK;
}
