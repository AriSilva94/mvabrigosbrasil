import { ApiError } from "./errors";
import { apiPath, requestJson } from "./request";

let refreshInFlight: Promise<unknown> | null = null;

function browserInit(init?: RequestInit): RequestInit {
  return { ...init, credentials: "include" };
}

// `auth/me` fica de fora porque o proxy já renova a sessão na navegação;
// renovar aqui só dobraria as chamadas de todo visitante anônimo.
const NO_REFRESH_PATHS = new Set(["auth/login", "auth/logout", "auth/refresh", "auth/me"]);

function isSessionPath(path: string): boolean {
  const normalized = path.replace(/[?#].*$/, "").replace(/^\/+/, "");
  return NO_REFRESH_PATHS.has(normalized);
}

export async function refreshSession(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = requestJson(fetch, apiPath("/auth/refresh"), {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      refreshInFlight = null;
    });
  }

  await refreshInFlight;
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiPath(path);
  const requestInit = browserInit(init);

  try {
    return await requestJson<T>(fetch, url, requestInit);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || isSessionPath(path)) {
      throw error;
    }
  }

  await refreshSession();

  return requestJson<T>(fetch, url, requestInit);
}
