import "server-only";

import { apiPath, requestJson } from "./request";

function internalApiOrigin(): string {
  return (process.env.INTERNAL_API_URL ?? "http://localhost:3001").replace(/\/+$/, "");
}

export function publicServerApi<T>(path: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(fetch, `${internalApiOrigin()}${apiPath(path)}`, init);
}
