export const REGISTER_TYPES = {
  shelter: "abrigo",
  volunteer: "voluntario",
  manager: "gerente",
} as const;

export type RegisterType = (typeof REGISTER_TYPES)[keyof typeof REGISTER_TYPES];

export function isRegisterType(value?: string | null): value is RegisterType {
  return value === REGISTER_TYPES.shelter || value === REGISTER_TYPES.volunteer || value === REGISTER_TYPES.manager;
}

export function normalizeRegisterType(raw?: unknown): RegisterType | null {
  if (typeof raw !== "string") return null;

  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  return isRegisterType(normalized) ? (normalized as RegisterType) : null;
}
