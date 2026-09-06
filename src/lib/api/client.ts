import { ApiError } from "./errors";
import { apiPath, requestJson } from "./request";

let refreshInFlight: Promise<unknown> | null = null;

function browserInit(init?: RequestInit): RequestInit {
  return { ...init, credentials: "include" };
}

function isAuthPath(path: string): boolean {
  const normalized = path.replace(/[?#].*$/, "").replace(/^\/+/, "");
  return normalized === "auth" || normalized.startsWith("auth/");
}

async function refreshSession(): Promise<void> {
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
    if (!(error instanceof ApiError) || error.status !== 401 || isAuthPath(path)) {
      throw error;
    }
  }

  await refreshSession();

  return requestJson<T>(fetch, url, requestInit);
}
