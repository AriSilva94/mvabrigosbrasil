import { ApiError } from "./errors";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export function apiPath(path: string): string {
  return `/api/v1/${path.replace(/^\/+/, "")}`;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessage(response: Response, body: unknown): string {
  if (body && typeof body === "object") {
    const error = "error" in body ? body.error : null;
    if (typeof error === "string" && error) return error;

    const message = "message" in body ? body.message : null;
    if (typeof message === "string" && message) return message;
  }

  return response.statusText || "Erro na requisição";
}

export async function requestJson<T>(
  fetcher: Fetcher,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetcher(input, init);
  const body = await readBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response, body), body);
  }

  return body as T;
}
