import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const mocks = vi.hoisted(() => ({ apiClient: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ apiClient: mocks.apiClient }));

import {
  loadPublicMapStatistics,
  parseDatabaseDataset,
  parseMapStatistics,
} from "./publicData";

const mapStatistics = {
  byState: [
    { state: "RS", count: 2 },
    { state: "SP", count: 1 },
  ],
  byType: { total: 3, public: 1, private: 1, mixed: 0, temporary: 1 },
};

const databaseDataset = {
  shelters: [
    {
      id: 42,
      title: "Abrigo A",
      postDate: "2024-02-03T04:05:06.000Z",
      year: 2024,
      month: 2,
      state: "RS",
      type: "LT-PI",
    },
  ],
  movements: [
    {
      id: 123,
      postType: "dinamica_lar",
      year: 2024,
      month: 3,
      shelterId: 42,
      shelterState: "RS",
      shelterType: "LT-PI",
      metrics: {
        entradas: 10,
        entradasGatos: 2,
        adocoes: 3,
        adocoesGatos: 1,
        devolucoes: 4,
        devolucoesGatos: 2,
        eutanasias: 0,
        eutanasiasGatos: 1,
        mortesNaturais: 2,
        mortesNaturaisGatos: 3,
        retornoTutor: 11,
        retornoTutorGatos: 6,
        retornoLocal: 15,
        retornoLocalGatos: 8,
      },
    },
  ],
  years: [2024],
  states: ["RS"],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("public data contracts", () => {
  it("preserves the map statistics shape and counts", () => {
    expect(parseMapStatistics(mapStatistics)).toEqual(mapStatistics);
  });

  it("preserves every database dataset collection and nested metric", () => {
    const parsed = parseDatabaseDataset(databaseDataset);

    expect(parsed).toEqual(databaseDataset);
    expect(parsed.shelters).toHaveLength(1);
    expect(parsed.movements).toHaveLength(1);
    expect(parsed.years).toHaveLength(1);
    expect(parsed.states).toHaveLength(1);
  });

  it.each([
    [{ byState: [], byType: { total: 0 } }, "mapa"],
    [{ shelters: [], movements: [], years: [] }, "banco de dados"],
  ])("rejects an invalid successful payload for %s", (payload, expected) => {
    const parse = expected === "mapa" ? parseMapStatistics : parseDatabaseDataset;

    expect(() => parse(payload)).toThrow(TypeError);
  });
});

describe("loadPublicMapStatistics", () => {
  it("uses the public browser endpoint and forwards the abort signal", async () => {
    const controller = new AbortController();
    mocks.apiClient.mockResolvedValue(mapStatistics);

    await expect(loadPublicMapStatistics(controller.signal)).resolves.toEqual(
      mapStatistics,
    );

    expect(mocks.apiClient).toHaveBeenCalledWith("/public/map-statistics", {
      signal: controller.signal,
    });
  });

  it("does not mask HTTP errors as invalid payload errors", async () => {
    const failure = new ApiError(500, "Falha no backend", { error: "Falha" });
    mocks.apiClient.mockRejectedValue(failure);

    await expect(loadPublicMapStatistics()).rejects.toBe(failure);
  });
});
