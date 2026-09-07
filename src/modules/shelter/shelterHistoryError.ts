import { ApiError } from "@/lib/api/errors";

const HISTORY_ERROR_FALLBACK = "Erro ao carregar histórico";

export function isCurrentShelterHistoryRequest(
  requestId: number,
  currentRequestId: number,
): boolean {
  return requestId === currentRequestId;
}

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
