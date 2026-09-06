import { redirect } from "next/navigation";

import { REGISTER_TYPES, type RegisterType } from "@/constants/registerTypes";
import { getSession, type SessionClaims } from "@/lib/auth/session";

export const TEAM_ALLOWED_PATHS = ["/painel", "/dinamica-populacional"];
export const ADMIN_ALLOWED_PATHS = [
  "/painel",
  "/admin/gerentes",
  "/admin/abrigos",
];

export type UserAccessInfo = {
  userId: string;
  email: string | null;
  registerType: RegisterType | null;
  isTeamOnly: boolean;
  isTeamDisabled: boolean;
  creatorProfileId: string | null;
};

function isPathAllowed(pathname: string, allowed: string[]): boolean {
  return allowed.some(
    (allowedPath) =>
      pathname === allowedPath || pathname.startsWith(`${allowedPath}/`),
  );
}

export function mapSessionClaimsToUserAccess(
  session: SessionClaims,
): UserAccessInfo {
  return {
    userId: session.sub,
    email: session.email ?? null,
    registerType: session.role ?? null,
    isTeamOnly: session.isTeamOnly,
    isTeamDisabled: session.teamDisabled,
    creatorProfileId: session.creatorProfileId ?? null,
  };
}

export async function loadUserAccess(): Promise<UserAccessInfo | null> {
  const session = await getSession();
  return session ? mapSessionClaimsToUserAccess(session) : null;
}

export function getAccessRedirect(
  pathname: string,
  access: UserAccessInfo,
): string | null {
  if (
    access.registerType === REGISTER_TYPES.admin &&
    !isPathAllowed(pathname, ADMIN_ALLOWED_PATHS)
  ) {
    return "/painel";
  }

  if (
    access.isTeamOnly &&
    (access.isTeamDisabled || !isPathAllowed(pathname, TEAM_ALLOWED_PATHS)) &&
    pathname !== "/painel"
  ) {
    return "/painel";
  }

  return null;
}

export async function enforceTeamAccess(
  pathname: string,
): Promise<UserAccessInfo> {
  const access = await loadUserAccess();

  if (!access) {
    redirect("/login");
  }

  const redirectTo = getAccessRedirect(pathname, access);
  if (redirectTo) redirect(redirectTo);

  return access;
}

export function filterPanelShortcuts<T extends { id: string }>(
  shortcuts: readonly T[],
  isTeamOnly: boolean,
): readonly T[] {
  if (!isTeamOnly) return shortcuts;
  return shortcuts.filter((item) => item.id === "dynamic-data");
}
