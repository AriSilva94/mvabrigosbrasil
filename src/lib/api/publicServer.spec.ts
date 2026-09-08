import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { publicServerApi } from "./publicServer";

const originalInternalApiUrl = process.env.INTERNAL_API_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.INTERNAL_API_URL = originalInternalApiUrl;
});

describe("publicServerApi", () => {
  it("calls the internal API without cookies and preserves cache options", async () => {
    process.env.INTERNAL_API_URL = "http://nestjs.internal:3001/";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetcher);

    await expect(
      publicServerApi("/public/example", { next: { revalidate: 900 } }),
    ).resolves.toEqual({ ok: true });

    expect(fetcher).toHaveBeenCalledWith(
      "http://nestjs.internal:3001/api/v1/public/example",
      { next: { revalidate: 900 } },
    );
    expect(new Headers(fetcher.mock.calls[0][1]?.headers).has("cookie")).toBe(false);
  });
});
