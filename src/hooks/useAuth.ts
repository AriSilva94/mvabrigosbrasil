"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import type { RegisterType } from "@/constants/registerTypes";
import { apiClient } from "@/lib/api/client";
import {
  createAuthStateCoordinator,
  type AuthStateSnapshot,
} from "@/lib/auth/authState";

export type AuthUser = {
  id: string;
  email: string;
  role: RegisterType | null;
  isTeamOnly: boolean;
  teamDisabled: boolean;
  creatorProfileId: string | null;
};

type AuthMeResponse = { user: AuthUser };

const serverSnapshot: AuthStateSnapshot<AuthUser> = {
  user: null,
  isLoading: true,
};

const authState = createAuthStateCoordinator<AuthUser>(() =>
  apiClient<AuthMeResponse>("/auth/me").then(({ user }) => user),
);

export function refreshAuthUser(): Promise<AuthUser | null> {
  return authState.refresh();
}

export function useAuth() {
  const router = useRouter();
  const state = useSyncExternalStore(
    authState.subscribe,
    authState.getSnapshot,
    () => serverSnapshot,
  );

  useEffect(() => {
    void authState.load();
  }, []);

  const logout = useCallback(async () => {
    await authState.logout(() =>
      apiClient("/auth/logout", { method: "POST" }),
    );
    router.refresh();
  }, [router]);

  return { user: state.user, isLoading: state.isLoading, logout };
}
