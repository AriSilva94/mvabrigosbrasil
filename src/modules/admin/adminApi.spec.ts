import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiClient: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ apiClient: mocks.apiClient }));

import { assignManagerShelters, getAdminManagers, getAdminShelters } from "./adminApi";

beforeEach(() => vi.clearAllMocks());

describe("admin browser API", () => {
  it("loads managers while accepting null and synthetic shelter identifiers", async () => {
    const managers = [{
      id: "manager-1",
      email: null,
      wp_user_id: null,
      created_at: "2026-09-08T12:00:00.000Z",
      shelters: [
        { id: "s1", name: "Sem legado", wp_post_id: null },
        { id: "s2", name: "Sintético", wp_post_id: -1001 },
      ],
    }];
    mocks.apiClient.mockResolvedValue({ managers });

    await expect(getAdminManagers()).resolves.toEqual(managers);
    expect(mocks.apiClient).toHaveBeenCalledWith("/admin/managers", { signal: undefined });
  });

  it("loads shelters and sends UUID assignments to Nest", async () => {
    const signal = new AbortController().signal;
    const shelters = [{ id: "s1", name: "Abrigo", wp_post_id: null }];
    mocks.apiClient
      .mockResolvedValueOnce({ shelters })
      .mockResolvedValueOnce({ success: true });

    await expect(getAdminShelters(signal)).resolves.toEqual(shelters);
    await expect(assignManagerShelters("manager/1", ["s1"])).resolves.toEqual({ success: true });

    expect(mocks.apiClient).toHaveBeenNthCalledWith(1, "/shelters", { signal });
    expect(mocks.apiClient).toHaveBeenNthCalledWith(
      2,
      "/admin/managers/manager%2F1/shelters",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelter_ids: ["s1"] }),
      },
    );
  });

  it("rejects malformed successful payloads", async () => {
    mocks.apiClient.mockResolvedValue({ managers: [{ id: "manager-1" }] });
    await expect(getAdminManagers()).rejects.toBeInstanceOf(TypeError);
  });
});
