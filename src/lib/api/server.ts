import "server-only";

import { cookies } from "next/headers";

import { withInternalToken } from "./internalToken";
import { apiPath, requestJson } from "./request";

function internalApiOrigin(): string {
  return (process.env.INTERNAL_API_URL ?? "http://localhost:3001").replace(
    /\/+$/,
    "",
  );
}

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const headers = withInternalToken(new Headers(init?.headers));

  if (cookieHeader) headers.set("cookie", cookieHeader);

  return requestJson<T>(fetch, `${internalApiOrigin()}${apiPath(path)}`, {
    ...init,
    cache: "no-store",
    headers,
  });
}
