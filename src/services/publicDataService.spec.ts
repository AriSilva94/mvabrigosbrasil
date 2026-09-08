import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serverApi: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/server", () => ({ serverApi: mocks.serverApi }));
vi.mock("@/lib/supabase/supabase-admin", () => ({ getSupabaseAdminClient: vi.fn() }));
vi.mock("@/services/volunteersAggregator", () => ({
  fetchVolunteerCardsFromSupabase: vi.fn(),
  fetchVolunteerProfileBySlugFromSupabase: vi.fn(),
}));

import { getVacancyCards, getVacancyCardsOrThrow } from "./publicDataService";

beforeEach(() => vi.clearAllMocks());

describe("public vacancy cards", () => {
  it("keeps the public page usable with an empty vacancy fallback", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.serverApi.mockRejectedValue(new Error("backend unavailable"));
    await expect(getVacancyCards()).resolves.toEqual([]);
  });

  it("preserves the protected vacancies page error state", async () => {
    const error = new Error("backend unavailable");
    mocks.serverApi.mockRejectedValue(error);
    await expect(getVacancyCardsOrThrow()).rejects.toBe(error);
  });
});
