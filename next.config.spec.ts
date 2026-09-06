import { afterEach, describe, expect, it } from "vitest";

import nextConfig from "./next.config";

const originalInternalApiUrl = process.env.INTERNAL_API_URL;

afterEach(() => {
  process.env.INTERNAL_API_URL = originalInternalApiUrl;
});

async function rewrites() {
  if (typeof nextConfig.rewrites !== "function") {
    throw new Error("Next rewrites are not configured");
  }
  return nextConfig.rewrites();
}

describe("Next API rewrite", () => {
  it("uses the local backend fallback", async () => {
    delete process.env.INTERNAL_API_URL;

    await expect(rewrites()).resolves.toEqual([
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3001/api/v1/:path*",
      },
    ]);
  });

  it("removes every trailing slash from INTERNAL_API_URL", async () => {
    process.env.INTERNAL_API_URL = "http://nestjs.internal:3001///";

    await expect(rewrites()).resolves.toEqual([
      {
        source: "/api/v1/:path*",
        destination: "http://nestjs.internal:3001/api/v1/:path*",
      },
    ]);
  });

  it("preserves the existing Next configuration", () => {
    expect(nextConfig.turbopack).toEqual({});
    expect(nextConfig.webpack).toBeTypeOf("function");
    expect(nextConfig.images).toMatchObject({
      qualities: [50, 75, 85, 100],
      remotePatterns: expect.arrayContaining([
        expect.objectContaining({ hostname: "mvabrigosbrasil.com.br" }),
        expect.objectContaining({ hostname: "img.youtube.com" }),
      ]),
    });
  });
});
