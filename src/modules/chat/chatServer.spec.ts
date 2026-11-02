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
