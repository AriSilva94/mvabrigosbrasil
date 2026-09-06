import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./errors";

const mocks = vi.hoisted(() => ({ cookies: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));

import { serverApi } from "./server";

const originalInternalApiUrl = process.env.INTERNAL_API_URL;

beforeEach(() => {
  mocks.cookies.mockResolvedValue({
    toString: () => "mv_at=access-token; consent=yes",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  process.env.INTERNAL_API_URL = originalInternalApiUrl;
});

describe("serverApi", () => {
  it("normalizes the direct URL, forwards all cookies, and defaults to no-store", async () => {
    process.env.INTERNAL_API_URL = "http://nestjs.internal:3001///";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "user-1" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetcher);

    await expect(serverApi("///auth/me")).resolves.toEqual({ id: "user-1" });

    expect(fetcher).toHaveBeenCalledWith(
      "http://nestjs.internal:3001/api/v1/auth/me",
      expect.objectContaining({ cache: "no-store" }),
    );
    const init = fetcher.mock.calls[0][1];
    expect(new Headers(init?.headers).get("cookie")).toBe(
      "mv_at=access-token; consent=yes",
    );
  });

  it("preserves caller headers and forces no-store over caller cache settings", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetcher);

    await serverApi("/shelters", {
      method: "POST",
      cache: "force-cache",
      headers: { "content-type": "application/json", "x-request-id": "req-1" },
      body: JSON.stringify({ name: "Abrigo" }),
    });

    const init = fetcher.mock.calls[0][1];
    const headers = new Headers(init?.headers);
    expect(init).toMatchObject({ method: "POST", cache: "no-store" });
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-request-id")).toBe("req-1");
    expect(headers.get("cookie")).toBe("mv_at=access-token; consent=yes");
  });

  it("propagates typed backend errors", async () => {
    const body = { error: "Acesso negado", reason: "role" };
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify(body), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const error = await serverApi("/admin/shelters").catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, message: "Acesso negado", body });
  });
});
