import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ publicServerApi: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/publicServer", () => ({
  publicServerApi: mocks.publicServerApi,
}));

import { ApiError } from "@/lib/api/errors";
import {
  getVolunteerCards,
  getVolunteerCardsOrThrow,
  getVolunteerProfile,
  getVacancyCards,
  getVacancyCardsOrThrow,
} from "./publicDataService";

beforeEach(() => vi.clearAllMocks());

describe("public vacancy cards", () => {
  it("keeps the public page usable with an empty vacancy fallback", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.publicServerApi.mockRejectedValue(new Error("backend unavailable"));
    await expect(getVacancyCards()).resolves.toEqual([]);
  });

  it("preserves the protected vacancies page error state", async () => {
    const error = new Error("backend unavailable");
    mocks.publicServerApi.mockRejectedValue(error);
    await expect(getVacancyCardsOrThrow()).rejects.toBe(error);
  });
});

describe("public volunteers", () => {
  it("parses cards from Nest and preserves the public page empty fallback", async () => {
    const card = { id: "v1", name: "Ana", slug: "ana-1234abcd", source: "new" };
    mocks.publicServerApi.mockResolvedValueOnce({ volunteers: [card] });

    await expect(getVolunteerCardsOrThrow()).resolves.toEqual([card]);
    expect(mocks.publicServerApi).toHaveBeenCalledWith("/volunteers");

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.publicServerApi.mockRejectedValueOnce(new Error("backend unavailable"));
    await expect(getVolunteerCards()).resolves.toEqual([]);
  });

  it("returns null only for a 404 public profile", async () => {
    mocks.publicServerApi.mockRejectedValueOnce(new ApiError(404, "Voluntário não encontrado"));
    await expect(getVolunteerProfile("ana")).resolves.toBeNull();

    const failure = new ApiError(500, "Falha");
    mocks.publicServerApi.mockRejectedValueOnce(failure);
    await expect(getVolunteerProfile("ana")).rejects.toBe(failure);
  });

  it("does not request an empty slug", async () => {
    await expect(getVolunteerProfile("  ")).resolves.toBeNull();
    expect(mocks.publicServerApi).not.toHaveBeenCalled();
  });
});
