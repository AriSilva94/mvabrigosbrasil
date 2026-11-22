import { ApiError } from "@/lib/api/errors";

// Mesmo intervalo do cooldown de reenvio da API.
export const RESEND_VERIFICATION_COOLDOWN_SECONDS = 60;

const PENDING_EMAIL_KEY = "mv:pending-verification-email";

// O e-mail não vai na URL: a query string chega ao GTM/GA como page_location.
export function rememberPendingVerificationEmail(email: string): void {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  } catch {
    // Sem storage a tela só deixa de oferecer o reenvio.
  }
}

export function readPendingVerificationEmail(): string | null {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY);
  } catch {
    return null;
  }
}

function hasErrorCode(error: unknown, status: number, code: string): boolean {
  if (!(error instanceof ApiError) || error.status !== status) return false;

  const body = error.body;
  return (
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    body.code === code
  );
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  return hasErrorCode(error, 403, "EMAIL_NOT_VERIFIED");
}

export function isInvalidPasswordError(error: unknown): boolean {
  return hasErrorCode(error, 400, "INVALID_PASSWORD");
}
