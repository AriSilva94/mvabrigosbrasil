import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serverApi: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/server", () => ({ serverApi: mocks.serverApi }));

import { ApiError } from "@/lib/api/errors";
import {
  loadDynamicsSummary,
  loadManagerDynamicsSummary,
} from "./dynamicsSummary";

const response = {
  summary: {
    displayName: "Abrigo Esperança",
    totalAnimals: 7,
    shelterTypeLabel: "Privado",
    hasTemporaryAgreement: false,
    dogsCount: 4,
    catsCount: 3,
    totalAnimalsLt: null,
    dogsCountLt: null,
    catsCountLt: null,
  },
  shelterId: "shelter-1",
};

beforeEach(() => vi.clearAllMocks());

describe("dynamics server summaries", () => {
  it("loads the owner or team-only summary without a shelter query", async () => {
    mocks.serverApi.mockResolvedValue(response);

    await expect(loadDynamicsSummary()).resolves.toEqual(response);
    expect(mocks.serverApi).toHaveBeenCalledWith("/dynamics/summary");
  });

  it("loads a linked manager shelter by wp post id", async () => {
    mocks.serverApi.mockResolvedValue(response);

    await expect(loadManagerDynamicsSummary(42)).resolves.toEqual(response);
    expect(mocks.serverApi).toHaveBeenCalledWith(
      "/dynamics/summary?shelter_id=42",
    );
  });

  it.each([403, 404])("maps inaccessible manager status %i to null", async (status) => {
    mocks.serverApi.mockRejectedValue(new ApiError(status, "not_found"));

    await expect(loadManagerDynamicsSummary(42)).resolves.toBeNull();
  });

  it("maps an unlinked manager summary to null", async () => {
    mocks.serverApi.mockResolvedValue({
      summary: {
        ...response.summary,
        displayName: null,
        totalAnimals: null,
      },
      shelterId: null,
    });

    await expect(loadManagerDynamicsSummary(42)).resolves.toBeNull();
  });

  it("does not mask server failures as an inaccessible shelter", async () => {
    const failure = new ApiError(500, "internal_error");
    mocks.serverApi.mockRejectedValue(failure);

    await expect(loadManagerDynamicsSummary(42)).rejects.toBe(failure);
  });

  it("rejects malformed summaries", async () => {
    mocks.serverApi.mockResolvedValue({ summary: null, shelterId: 1 });

    await expect(loadDynamicsSummary()).rejects.toThrow(
      "Resposta inválida ao carregar resumo da dinâmica populacional.",
    );
  });
});
