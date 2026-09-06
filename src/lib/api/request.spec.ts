import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { apiPath, requestJson } from "@/lib/api/request";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiPath", () => {
  it("prefixes API paths", () => {
    expect(apiPath("/auth/me")).toBe("/api/v1/auth/me");
  });

  it("removes all duplicate leading slashes", () => {
    expect(apiPath("///shelters")).toBe("/api/v1/shelters");
  });
});

describe("requestJson", () => {
  it("throws an ApiError for JSON errors", async () => {
    const body = { error: "Erro do backend", code: "backend_error" };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(requestJson(fetcher, "/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      message: "Erro do backend",
      body,
    });
  });

  it("throws an ApiError for non-JSON errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("upstream unavailable", {
        status: 502,
        statusText: "Bad Gateway",
        headers: { "content-type": "text/plain" },
      }),
    );

    const error = await requestJson(fetcher, "/x").catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 502,
      message: "Bad Gateway",
      body: "upstream unavailable",
    });
  });
});

describe("apiClient", () => {
  it("refreshes once and retries the original non-auth request once", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "shelter-1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(apiClient<{ id: string }>("/shelters/me")).resolves.toEqual({
      id: "shelter-1",
    });

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/v1/shelters/me",
      "/api/v1/auth/refresh",
      "/api/v1/shelters/me",
    ]);
    expect(fetcher.mock.calls.every(([, init]) => init?.credentials === "include")).toBe(true);
  });

  it("does not refresh auth endpoints", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(apiClient("/auth/me")).rejects.toMatchObject({ status: 401 });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("never retries more than once", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(apiClient("/shelters/me")).rejects.toMatchObject({ status: 401 });

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.filter(([url]) => url === "/api/v1/auth/refresh")).toHaveLength(1);
  });
});
