export function parseTemporaryAgreementValue(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "sim") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "nao") {
    return false;
  }

  return null;
}
