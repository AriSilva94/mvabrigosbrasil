import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serverApi: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/server", () => ({ serverApi: mocks.serverApi }));

import { loadManagerShelters } from "./managerShelters";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadManagerShelters", () => {
  it("returns the normal empty state from a successful empty response", async () => {
    mocks.serverApi.mockResolvedValue({ shelters: [] });

    await expect(loadManagerShelters()).resolves.toEqual([]);
    expect(mocks.serverApi).toHaveBeenCalledOnce();
    expect(mocks.serverApi).toHaveBeenCalledWith(
      "/admin/managers/me/shelters",
    );
  });

  it("keeps valid real and synthetic shelters and filters invalid entries", async () => {
    mocks.serverApi.mockResolvedValue({
      shelters: [
        { id: "real", name: "Abrigo Real", wp_post_id: 42 },
        { id: "synthetic", name: "Abrigo Novo", wp_post_id: -123 },
        { id: "", name: "Sem ID", wp_post_id: 1 },
        { id: "blank-id", name: "   ", wp_post_id: 2 },
        { id: 3, name: "ID numérico", wp_post_id: 3 },
        { id: "null-id", name: "Sem post", wp_post_id: null },
        { id: "unsafe", name: "Post inseguro", wp_post_id: 2 ** 53 },
        { id: "decimal", name: "Post decimal", wp_post_id: 1.5 },
        { id: "string-post", name: "Post texto", wp_post_id: "4" },
        { id: "zero", name: "Post zero", wp_post_id: 0 },
        null,
      ],
    });

    await expect(loadManagerShelters()).resolves.toEqual([
      { id: "real", name: "Abrigo Real", wp_post_id: 42 },
      { id: "synthetic", name: "Abrigo Novo", wp_post_id: -123 },
    ]);
  });

  it.each([
    null,
    {},
    { shelters: null },
    { shelters: "not-an-array" },
  ])("rejects malformed backend response %#", async (response) => {
    mocks.serverApi.mockResolvedValue(response);

    await expect(loadManagerShelters()).rejects.toThrow(
      "Resposta inválida ao carregar abrigos do gerente.",
    );
  });

  it("propagates the original API failure", async () => {
    const failure = new Error("backend unavailable");
    mocks.serverApi.mockRejectedValue(failure);

    await expect(loadManagerShelters()).rejects.toBe(failure);
  });
});
