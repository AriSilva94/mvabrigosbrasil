import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

vi.mock("server-only", () => ({}));

import { loadPublicDatabaseDataset } from "./publicDataServer";

const originalInternalApiUrl = process.env.INTERNAL_API_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.INTERNAL_API_URL = originalInternalApiUrl;
});

describe("loadPublicDatabaseDataset", () => {
  it("uses the internal public endpoint without the Next data cache and no cookies", async () => {
    process.env.INTERNAL_API_URL = "http://nestjs.internal:3001///";
    const dataset = {
      shelters: [],
      movements: [],
      years: [2025, 2024],
      states: ["RS", "SP"],
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(dataset), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetcher);

    await expect(loadPublicDatabaseDataset()).resolves.toEqual(dataset);

    expect(fetcher).toHaveBeenCalledWith(
      "http://nestjs.internal:3001/api/v1/public/database-dataset",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(new Headers(fetcher.mock.calls[0][1]?.headers).has("cookie")).toBe(
      false,
    );
  });

  it("propagates 404 and 5xx responses without replacing them with empty data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ error: "Não encontrado" }), {
          status: 404,
        }),
      ),
    );

    const error = await loadPublicDatabaseDataset().catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: "Não encontrado" });
  });

  it("rejects an invalid successful response instead of masking it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ shelters: [], movements: [] }), {
          status: 200,
        }),
      ),
    );

    await expect(loadPublicDatabaseDataset()).rejects.toBeInstanceOf(TypeError);
  });
});
