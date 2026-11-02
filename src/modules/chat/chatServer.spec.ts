import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serverApi: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/server", () => ({ serverApi: mocks.serverApi }));

import { loadThreadsByVacancy } from "./chatServer";

beforeEach(() => vi.clearAllMocks());

describe("loadThreadsByVacancy", () => {
  it("returns the volunteer's conversation id per vacancy", async () => {
    mocks.serverApi.mockResolvedValue({ threads: { v1: "t1" } });
    await expect(loadThreadsByVacancy()).resolves.toEqual({ v1: "t1" });
    expect(mocks.serverApi).toHaveBeenCalledWith("/chat/threads/by-vacancy");
  });

  it("falls back to no conversations when the request fails", async () => {
    mocks.serverApi.mockRejectedValue(new Error("down"));
    await expect(loadThreadsByVacancy()).resolves.toEqual({});
  });
});

describe("loadThreadWithVolunteer", () => {
  it("returns the conversation id for the volunteer slug", async () => {
    const { loadThreadWithVolunteer } = await import("./chatServer");
    mocks.serverApi.mockResolvedValue({ thread_id: "t1" });
    await expect(loadThreadWithVolunteer("maria-123")).resolves.toBe("t1");
    expect(mocks.serverApi).toHaveBeenCalledWith("/chat/threads/with-volunteer/maria-123");
  });

  it("encodes the slug", async () => {
    const { loadThreadWithVolunteer } = await import("./chatServer");
    mocks.serverApi.mockResolvedValue({ thread_id: null });
    await loadThreadWithVolunteer("a/b");
    expect(mocks.serverApi).toHaveBeenCalledWith("/chat/threads/with-volunteer/a%2Fb");
  });

  it("is null for anonymous visitors and request failures", async () => {
    const { loadThreadWithVolunteer } = await import("./chatServer");
    mocks.serverApi.mockRejectedValue(new Error("401"));
    await expect(loadThreadWithVolunteer("maria-123")).resolves.toBeNull();
  });
});
