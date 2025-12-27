import { redirect } from "next/navigation";

import type { RegisterType } from "@/constants/registerTypes";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { resolvePostTypeForUser } from "@/modules/auth/postTypeResolver";
import { findProfileById } from "@/modules/auth/repositories/profileRepository";

const TEAM_ALLOWED_PATHS = ["/painel", "/dinamica-populacional"];

export type UserAccessInfo = {
  userId: string;
  email: string | null;
  registerType: RegisterType | null;
  isTeamOnly: boolean;
  isTeamDisabled: boolean;
};

function isPathAllowed(pathname: string, allowed: string[]): boolean {
  return allowed.some(
    (allowedPath) =>
      pathname === allowedPath || pathname.startsWith(`${allowedPath}/`),
  );
}

export async function loadUserAccess(): Promise<UserAccessInfo | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  const supabaseAdmin = getSupabaseAdminClient();

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
    data.user.id,
  );
  if (authError) {
    console.error("teamAccess.loadUserAccess: erro ao buscar user auth", authError);
  }

  const { profile } = await findProfileById(supabaseAdmin, data.user.id);
  const registerType = await resolvePostTypeForUser(supabaseAdmin, {
    supabaseUserId: data.user.id,
    email: data.user.email ?? profile?.email ?? null,
  });

  return {
    userId: data.user.id,
    email: data.user.email ?? profile?.email ?? null,
    registerType: registerType ?? null,
    isTeamOnly: Boolean(profile?.is_team_only),
    isTeamDisabled: Boolean(authUser?.user?.user_metadata?.teamDisabled),
  };
}

export async function enforceTeamAccess(pathname: string): Promise<UserAccessInfo> {
  const access = await loadUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (
    access.isTeamOnly &&
    (access.isTeamDisabled || !isPathAllowed(pathname, TEAM_ALLOWED_PATHS)) &&
    pathname !== "/painel"
  ) {
    redirect("/painel");
  }

  return access;
}

export function filterPanelShortcuts<T extends { id: string }>(
  shortcuts: readonly T[],
  isTeamOnly: boolean,
): readonly T[] {
  if (!isTeamOnly) return shortcuts;
  return shortcuts.filter((item) => item.id === "dynamic-data");
}
