import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enforceTeamAccess: vi.fn(),
  loadDynamicsSummary: vi.fn(),
  loadManagerDynamicsSummary: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/teamAccess", () => ({
  enforceTeamAccess: mocks.enforceTeamAccess,
}));
vi.mock("./dynamicsSummary", () => ({
  loadDynamicsSummary: mocks.loadDynamicsSummary,
  loadManagerDynamicsSummary: mocks.loadManagerDynamicsSummary,
}));

import {
  loadManagerPopulationDynamicsPageData,
  loadPopulationDynamicsPageData,
  parseShelterWpPostIdParam,
} from "./dynamicsPageData";

const summary = {
  displayName: "Abrigo Esperança",
  totalAnimals: 7,
  shelterTypeLabel: "Privado",
  hasTemporaryAgreement: false,
  dogsCount: 4,
  catsCount: 3,
  totalAnimalsLt: null,
  dogsCountLt: null,
  catsCountLt: null,
};

const access = {
  userId: "user-1",
  email: "owner@example.com",
  registerType: "abrigo" as const,
  isTeamOnly: false,
  isTeamDisabled: false,
  creatorProfileId: null,
};

beforeEach(() => vi.clearAllMocks());

describe("population dynamics page data", () => {
  it.each([
    ["42", 42],
    ["0", null],
    ["-1", -1],
    ["-2147483648", -2147483648],
    ["-2147483649", null],
    ["1.5", null],
    ["42abc", null],
    ["2147483648", null],
  ])("parses manager shelter id %s as %s", (value, expected) => {
    expect(parseShelterWpPostIdParam(value)).toBe(expected);
  });

  it.each([
    ["owner", access],
    [
      "team-only",
      {
        ...access,
        userId: "team-1",
        isTeamOnly: true,
        creatorProfileId: "user-1",
      },
    ],
  ])("preserves %s access and loads its claims-based summary", async (_label, currentAccess) => {
    mocks.enforceTeamAccess.mockResolvedValue(currentAccess);
    mocks.loadDynamicsSummary.mockResolvedValue({ summary, shelterId: "shelter-1" });

    await expect(loadPopulationDynamicsPageData()).resolves.toEqual({
      access: currentAccess,
      userSummary: summary,
    });
    expect(mocks.enforceTeamAccess).toHaveBeenCalledWith(
      "/dinamica-populacional",
    );
    expect(mocks.loadDynamicsSummary).toHaveBeenCalledOnce();
  });

  it("loads a linked shelter for a manager", async () => {
    const managerAccess = { ...access, registerType: "gerente" as const };
    mocks.enforceTeamAccess.mockResolvedValue(managerAccess);
    mocks.loadManagerDynamicsSummary.mockResolvedValue({
      summary,
      shelterId: "shelter-1",
    });

    await expect(
      loadManagerPopulationDynamicsPageData("42", 42),
    ).resolves.toEqual({ access: managerAccess, userSummary: summary });
    expect(mocks.enforceTeamAccess).toHaveBeenCalledWith(
      "/dinamica-populacional/42",
    );
    expect(mocks.loadManagerDynamicsSummary).toHaveBeenCalledWith(42);
  });

  it("returns null for a non-manager before requesting a shelter", async () => {
    mocks.enforceTeamAccess.mockResolvedValue(access);

    await expect(
      loadManagerPopulationDynamicsPageData("42", 42),
    ).resolves.toBeNull();
    expect(mocks.loadManagerDynamicsSummary).not.toHaveBeenCalled();
  });

  it("returns null for an inaccessible manager shelter", async () => {
    mocks.enforceTeamAccess.mockResolvedValue({
      ...access,
      registerType: "gerente",
    });
    mocks.loadManagerDynamicsSummary.mockResolvedValue(null);

    await expect(
      loadManagerPopulationDynamicsPageData("42", 42),
    ).resolves.toBeNull();
  });

  it("propagates manager server failures", async () => {
    const failure = new Error("backend unavailable");
    mocks.enforceTeamAccess.mockResolvedValue({
      ...access,
      registerType: "gerente",
    });
    mocks.loadManagerDynamicsSummary.mockRejectedValue(failure);

    await expect(
      loadManagerPopulationDynamicsPageData("42", 42),
    ).rejects.toBe(failure);
  });
});
