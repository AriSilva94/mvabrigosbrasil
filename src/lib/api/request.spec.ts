import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { apiPath, requestJson } from "@/lib/api/request";

afterEach(() => {
  vi.unstubAllGlobals();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

async function waitForCount(getCount: () => number, expected: number) {
  for (let i = 0; i < 20; i += 1) {
    if (getCount() === expected) return;

    await Promise.resolve();
  }

  expect(getCount()).toBe(expected);
}

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

  it("shares one refresh across concurrent 401s and lets a later request start a new refresh", async () => {
    const firstWave = [deferred<Response>(), deferred<Response>()];
    const firstRefresh = deferred<Response>();
    let refreshCalls = 0;
    let shelterCalls = 0;

    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);

      if (url === "/api/v1/auth/refresh") {
        refreshCalls += 1;

        if (refreshCalls === 1) return firstRefresh.promise;
        if (refreshCalls === 2) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        throw new Error(`unexpected refresh call ${refreshCalls}`);
      }

      if (url !== "/api/v1/shelters/me") {
        throw new Error(`unexpected url ${url}`);
      }

      shelterCalls += 1;

      if (shelterCalls <= 2) {
        return firstWave[shelterCalls - 1].promise;
      }

      if (shelterCalls <= 4) {
        return new Response(JSON.stringify({ id: "recovered" }), { status: 200 });
      }

      if (shelterCalls === 5) {
        return new Response(null, { status: 401 });
      }

      if (shelterCalls === 6) {
        return new Response(JSON.stringify({ id: "later-recovered" }), { status: 200 });
      }

      throw new Error(`unexpected shelter call ${shelterCalls}`);
    });

    vi.stubGlobal("fetch", fetcher);

    const first = apiClient<{ id: string }>("/shelters/me");
    const second = apiClient<{ id: string }>("/shelters/me");
    void first.catch(() => undefined);
    void second.catch(() => undefined);

    firstWave[0].resolve(new Response(null, { status: 401 }));
    firstWave[1].resolve(new Response(null, { status: 401 }));

    await waitForCount(() => refreshCalls, 1);

    firstRefresh.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(Promise.all([first, second])).resolves.toEqual([
      { id: "recovered" },
      { id: "recovered" },
    ]);

    const third = apiClient<{ id: string }>("/shelters/me");

    await expect(third).resolves.toEqual({ id: "later-recovered" });

    expect(fetcher.mock.calls.filter(([url]) => url === "/api/v1/auth/refresh")).toHaveLength(2);
    expect(fetcher.mock.calls.filter(([url]) => url === "/api/v1/shelters/me")).toHaveLength(6);
  });

  it("propagates refresh failures to all waiters and clears the shared refresh state", async () => {
    const firstWave = [deferred<Response>(), deferred<Response>()];
    let refreshCalls = 0;
    let shelterCalls = 0;

    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);

      if (url === "/api/v1/auth/refresh") {
        refreshCalls += 1;

        if (refreshCalls === 1) {
          return new Response(JSON.stringify({ error: "refresh failed" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        if (refreshCalls === 2) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        throw new Error(`unexpected refresh call ${refreshCalls}`);
      }

      if (url !== "/api/v1/shelters/me") {
        throw new Error(`unexpected url ${url}`);
      }

      shelterCalls += 1;

      if (shelterCalls <= 2) {
        return firstWave[shelterCalls - 1].promise;
      }

      if (shelterCalls === 3) {
        return new Response(null, { status: 401 });
      }

      if (shelterCalls === 4) {
        return new Response(JSON.stringify({ id: "recovered-after-failure" }), {
          status: 200,
        });
      }

      throw new Error(`unexpected shelter call ${shelterCalls}`);
    });

    vi.stubGlobal("fetch", fetcher);

    const first = apiClient<{ id: string }>("/shelters/me");
    const second = apiClient<{ id: string }>("/shelters/me");
    void first.catch(() => undefined);
    void second.catch(() => undefined);

    firstWave[0].resolve(new Response(null, { status: 401 }));
    firstWave[1].resolve(new Response(null, { status: 401 }));

    await waitForCount(() => refreshCalls, 1);

    await expect(first).rejects.toMatchObject({ status: 401 });
    await expect(second).rejects.toMatchObject({ status: 401 });

    const third = apiClient<{ id: string }>("/shelters/me");

    await expect(third).resolves.toEqual({ id: "recovered-after-failure" });

    expect(fetcher.mock.calls.filter(([url]) => url === "/api/v1/auth/refresh")).toHaveLength(2);
    expect(fetcher.mock.calls.filter(([url]) => url === "/api/v1/shelters/me")).toHaveLength(4);
  });

  it("does not refresh session endpoints with query strings or hash fragments", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
    });
    vi.stubGlobal("fetch", fetcher);

    await expect(apiClient("/auth/me?x=1")).rejects.toMatchObject({ status: 401 });
    await expect(apiClient("/auth/login#x")).rejects.toMatchObject({ status: 401 });
    await expect(apiClient("/auth/logout")).rejects.toMatchObject({ status: 401 });
    await expect(apiClient("/auth/refresh")).rejects.toMatchObject({ status: 401 });

    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it.each(["/auth/change-password", "/auth/register"])(
    "refreshes an expired session and retries %s",
    async (path) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response(null, { status: 401 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      vi.stubGlobal("fetch", fetcher);

      await expect(apiClient(path, { method: "POST" })).resolves.toEqual({ ok: true });

      expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
        `/api/v1${path}`,
        "/api/v1/auth/refresh",
        `/api/v1${path}`,
      ]);
    },
  );

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
