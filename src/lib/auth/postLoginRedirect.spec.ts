import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { resolvePostLoginRedirect } from "@/lib/auth/postLoginRedirect";

vi.mock("@/lib/api/client", () => ({
  apiClient: vi.fn(),
}));

const mockedApiClient = vi.mocked(apiClient);

describe("resolvePostLoginRedirect", () => {
  beforeEach(() => {
    mockedApiClient.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the backend post-login destination", async () => {
    mockedApiClient.mockResolvedValue({
      hasShelter: true,
      hasVolunteer: false,
      hasProfile: true,
      redirectTo: "/painel",
    });

    await expect(resolvePostLoginRedirect()).resolves.toBe("/painel");
    expect(mockedApiClient).toHaveBeenCalledWith("/auth/post-login-redirect");
  });

  it("falls back to profile when the lookup fails", async () => {
    mockedApiClient.mockRejectedValue(new Error("backend unavailable"));

    await expect(resolvePostLoginRedirect()).resolves.toBe("/meu-cadastro");
  });
});
