import { ApiError } from "@/lib/api/errors";

export const RESEND_VERIFICATION_COOLDOWN_SECONDS = 60;

const PENDING_EMAIL_KEY = "mv:pending-verification-email";

export function rememberPendingVerificationEmail(email: string): void {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  } catch {
    return;
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
