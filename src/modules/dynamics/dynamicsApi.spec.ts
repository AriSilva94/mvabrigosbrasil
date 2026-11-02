import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiClient: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ apiClient: mocks.apiClient }));

import {
  buildDynamicsPath,
  deleteDynamics,
  getDynamics,
  isCurrentDynamicsRequest,
  saveDynamics,
} from "./dynamicsApi";

const sections = [
  {
    dynamicType: "dinamica" as const,
    title: "Dinâmica Populacional",
    populationInitial: 3,
    populationCurrent: 4,
    populationInitialDogs: 2,
    populationInitialCats: 1,
    populationCurrentDogs: 3,
    populationCurrentCats: 1,
    stats: [
      {
        key: "entry" as const,
        label: "Taxa de entrada",
        value: 1,
        trend: "up" as const,
        helperText: null,
      },
    ],
    rows: [
      {
        id: "row-1",
        referenceLabel: "Janeiro de 2026",
        referenceDate: "2026-01-01T00:00:00.000Z",
        metrics: {
          entriesDogs: 1,
          entriesCats: 0,
          returnsDogs: 0,
          returnsCats: 0,
          adoptionsDogs: 0,
          adoptionsCats: 0,
          euthanasiasDogs: 0,
          euthanasiasCats: 0,
          naturalDeathsDogs: 0,
          naturalDeathsCats: 0,
          diseasesDogs: 0,
          diseasesCats: 0,
          tutorReturnDogs: 0,
          tutorReturnCats: 0,
          originReturnDogs: 0,
          originReturnCats: 0,
        },
        balance: 1,
        cumulativeBalance: 4,
      },
    ],
  },
];

const payload = {
  dynamicType: "dinamica" as const,
  month: "01",
  year: "2026",
  entries: 1,
  entriesCats: 0,
  adoptions: 0,
  adoptionsCats: 0,
  returns: 0,
  returnsCats: 0,
  euthanasias: 0,
  euthanasiasCats: 0,
  naturalDeaths: 0,
  naturalDeathsCats: 0,
  diseases: 0,
  diseasesCats: 0,
  tutorReturn: 0,
  tutorReturnCats: 0,
  originReturn: 0,
  originReturnCats: 0,
};

beforeEach(() => vi.clearAllMocks());

describe("dynamics browser API", () => {
  it("builds the owner and manager GET paths", () => {
    expect(buildDynamicsPath()).toBe("/dynamics");
    expect(buildDynamicsPath(42)).toBe("/dynamics?shelter_id=42");
  });

  it("loads and parses dynamics sections", async () => {
    mocks.apiClient.mockResolvedValue({ sections });

    await expect(getDynamics(42)).resolves.toEqual({ sections });
    expect(mocks.apiClient).toHaveBeenCalledWith(
      "/dynamics?shelter_id=42",
      { signal: undefined },
    );
  });

  it("saves the exact form payload through POST", async () => {
    mocks.apiClient.mockResolvedValue({ sections });

    await expect(saveDynamics(payload)).resolves.toEqual({ sections });
    expect(mocks.apiClient).toHaveBeenCalledWith("/dynamics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  });

  it("deletes the selected row through DELETE", async () => {
    mocks.apiClient.mockResolvedValue({ sections });

    await expect(deleteDynamics("row-1")).resolves.toEqual({ sections });
    expect(mocks.apiClient).toHaveBeenCalledWith("/dynamics", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "row-1" }),
    });
  });

  it("rejects malformed backend sections", async () => {
    mocks.apiClient.mockResolvedValue({ sections: [{ dynamicType: "other" }] });

    await expect(getDynamics()).rejects.toThrow(
      "Resposta inválida ao carregar dinâmica populacional.",
    );
  });

  it("identifies stale responses", () => {
    expect(isCurrentDynamicsRequest(3, 3, false)).toBe(true);
    expect(isCurrentDynamicsRequest(2, 3, false)).toBe(false);
    expect(isCurrentDynamicsRequest(3, 3, true)).toBe(false);
  });
});
