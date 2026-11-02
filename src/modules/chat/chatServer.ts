import "server-only";

import { serverApi } from "@/lib/api/server";
import { parseThreadsByVacancy, parseThreadWithVolunteer } from "./chatApi";

// O ícone de conversa nos cards é um atalho: falhar aqui não pode derrubar a
// listagem de vagas.
export async function loadThreadsByVacancy(): Promise<Record<string, string>> {
  try {
    return parseThreadsByVacancy(await serverApi<unknown>("/chat/threads/by-vacancy"));
  } catch {
    return {};
  }
}

// Visitante sem sessão ou sem conversa com o voluntário só não vê o botão.
export async function loadThreadWithVolunteer(slug: string): Promise<string | null> {
  try {
    return parseThreadWithVolunteer(
      await serverApi<unknown>(`/chat/threads/with-volunteer/${encodeURIComponent(slug)}`),
    );
  } catch {
    return null;
  }
}
