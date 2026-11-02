import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => vi.unstubAllEnvs());

describe("deployment health", () => {
  it("returns the running revision and prevents response caching", async () => {
    vi.stubEnv("APP_REVISION", "revision-under-test");
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok", revision: "revision-under-test" });
  });
});
