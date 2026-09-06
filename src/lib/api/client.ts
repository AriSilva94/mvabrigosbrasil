import { ApiError } from "./errors";
import { apiPath, requestJson } from "./request";

function browserInit(init?: RequestInit): RequestInit {
  return { ...init, credentials: "include" };
}

function isAuthPath(path: string): boolean {
  const normalized = path.replace(/^\/+/, "");
  return normalized === "auth" || normalized.startsWith("auth/");
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

  await requestJson(fetch, apiPath("/auth/refresh"), {
    method: "POST",
    credentials: "include",
  });

  return requestJson<T>(fetch, url, requestInit);
}
