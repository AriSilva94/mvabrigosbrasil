"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { RegisterType } from "@/constants/registerTypes";
import { apiClient } from "@/lib/api/client";

export type AuthUser = {
  id: string;
  email: string;
  role: RegisterType | null;
  isTeamOnly: boolean;
  teamDisabled: boolean;
  creatorProfileId: string | null;
};

type AuthMeResponse = { user: AuthUser };
type AuthSnapshot = { user: AuthUser | null; isLoading: boolean };

let snapshot: AuthSnapshot = { user: null, isLoading: true };
let hasLoaded = false;
let loadInFlight: Promise<AuthUser | null> | null = null;
const listeners = new Set<(next: AuthSnapshot) => void>();

function updateSnapshot(next: AuthSnapshot): void {
  snapshot = next;
  listeners.forEach((listener) => listener(snapshot));
}

async function loadAuthUser(force = false): Promise<AuthUser | null> {
  if (hasLoaded && !force) return snapshot.user;
  if (loadInFlight) return loadInFlight;

  loadInFlight = apiClient<AuthMeResponse>("/auth/me")
    .then(({ user }) => {
      updateSnapshot({ user, isLoading: false });
      return user;
    })
    .catch(() => {
      updateSnapshot({ user: null, isLoading: false });
      return null;
    })
    .finally(() => {
      hasLoaded = true;
      loadInFlight = null;
    });

  return loadInFlight;
}

export function refreshAuthUser(): Promise<AuthUser | null> {
  return loadAuthUser(true);
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthSnapshot>(snapshot);

  useEffect(() => {
    const listener = (next: AuthSnapshot) => setState(next);
    listeners.add(listener);
    void loadAuthUser();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      hasLoaded = true;
      updateSnapshot({ user: null, isLoading: false });
      router.refresh();
    }
  }, [router]);

  return { user: state.user, isLoading: state.isLoading, logout };
}
