import "server-only";

import { serverApi } from "@/lib/api/server";
import { parseThreadsByVacancy } from "./chatApi";

// O ícone de conversa nos cards é um atalho: falhar aqui não pode derrubar a
// listagem de vagas.
export async function loadThreadsByVacancy(): Promise<Record<string, string>> {
  try {
    return parseThreadsByVacancy(await serverApi<unknown>("/chat/threads/by-vacancy"));
  } catch {
    return {};
  }
}
