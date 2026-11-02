import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ serverApi: vi.fn() }));
vi.mock("@/lib/api/server", () => ({ serverApi: mocks.serverApi }));

import { loadAdminShelters } from "./adminPageData";

beforeEach(() => vi.clearAllMocks());

describe("loadAdminShelters", () => {
  it("loads the authenticated shelter list for the admin page", async () => {
    const shelters = [
      { id: "s1", name: "Abrigo legado", wp_post_id: 42 },
      { id: "s2", name: "Abrigo novo", wp_post_id: null },
    ];
    mocks.serverApi.mockResolvedValue({ shelters });

    await expect(loadAdminShelters()).resolves.toEqual(shelters);
    expect(mocks.serverApi).toHaveBeenCalledWith("/shelters");
  });

  it("rejects malformed successful responses", async () => {
    mocks.serverApi.mockResolvedValue({ shelters: [{ name: "Sem ID" }] });
    await expect(loadAdminShelters()).rejects.toBeInstanceOf(TypeError);
  });
});
