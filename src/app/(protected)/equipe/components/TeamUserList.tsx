"use client";

import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

import { Heading, Text } from "@/components/ui/typography";
import { apiClient } from "@/lib/api/client";

type TeamUser = {
  id: string;
  email: string | null;
  createdAt: string | null;
  isDisabled: boolean;
};

type FetchState =
  | { status: "idle" | "loading"; users: TeamUser[]; error: null }
  | { status: "error"; users: TeamUser[]; error: string };

async function fetchTeamUsers(): Promise<TeamUser[]> {
  const result = await apiClient<{ users?: TeamUser[] }>("/team/users");
  return result.users ?? [];
}

async function toggleTeamUser(userId: string, disable: boolean): Promise<void> {
  await apiClient<{ ok: true }>("/team/users/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, disable }),
  });
}

export default function TeamUserList(): JSX.Element {
  const [state, setState] = useState<FetchState>({
    status: "loading",
    users: [],
    error: null,
  });
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const loadUsersRef = useRef<(preserveUsersOnError?: boolean) => Promise<void>>(
    async () => undefined,
  );

  useEffect(() => {
    let isMounted = true;
    let latestRequest = 0;

    async function loadUsers(preserveUsersOnError = false) {
      const requestId = ++latestRequest;

      try {
        const users = await fetchTeamUsers();
        if (isMounted && requestId === latestRequest) {
          setState({ status: "idle", users, error: null });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao carregar usuários da equipe.";
        if (isMounted && requestId === latestRequest) {
          setState((prev) => ({
            status: "error",
            users: preserveUsersOnError ? prev.users : [],
            error: message,
          }));
        }
      }
    }

    loadUsersRef.current = loadUsers;

    void loadUsers();

    function handleRefresh() {
      setState((prev) => ({ ...prev, status: "loading", error: null }));
      void loadUsers();
    }

    window.addEventListener("team-users:refresh", handleRefresh);

    return () => {
      isMounted = false;
      latestRequest += 1;
      loadUsersRef.current = async () => undefined;
      window.removeEventListener("team-users:refresh", handleRefresh);
    };
  }, []);

  const { status, users, error } = state;
  const isLoading = status === "loading";

  async function handleToggle(userId: string, disable: boolean) {
    try {
      setPendingUserId(userId);
      await toggleTeamUser(userId, disable);
      await loadUsersRef.current(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao alterar status.";
      setState((prev) => ({
        status: "error",
        users: prev.users,
        error: message,
      }));
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(16,130,89,0.06)] md:px-6">
      <div className="flex items-center justify-between">
        <Heading as="h3" className="text-lg font-semibold text-brand-secondary">
          Usuários cadastrados
        </Heading>
        {isLoading && (
          <span className="text-sm font-medium text-[#7b8191]">Carregando…</span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <Text className="text-sm text-[#7b8191]">
          Nenhum usuário de equipe cadastrado ainda.
        </Text>
      )}

      {!isLoading && users.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {users.map((user) => (
            <li key={user.id} className="py-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <Text className="font-semibold text-[#4f5464]">
                    {user.email ?? "E-mail não informado"}
                  </Text>
                  <Text className="text-xs text-[#7b8191]">
                    Criado em:{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                      : "Data indisponível"}
                  </Text>
                  <Text className="text-xs font-semibold text-[#7b8191]">
                    Status: {user.isDisabled ? "Inativo" : "Ativo"}
                  </Text>
                </div>

                <div className="mt-2 md:mt-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(user.id, !user.isDisabled)}
                    disabled={pendingUserId === user.id}
                    className="inline-flex items-center rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pendingUserId === user.id
                      ? "Processando..."
                      : user.isDisabled
                      ? "Ativar"
                      : "Desativar"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
