import "server-only";

import { cookies } from "next/headers";

import { apiPath, requestJson } from "./request";

function internalApiOrigin(): string {
  return (process.env.INTERNAL_API_URL ?? "http://localhost:3001").replace(
    /\/+$/,
    "",
  );
}

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const headers = new Headers(init?.headers);

  if (cookieHeader) headers.set("cookie", cookieHeader);

  return requestJson<T>(fetch, `${internalApiOrigin()}${apiPath(path)}`, {
    cache: "no-store",
    ...init,
    headers,
  });
}
