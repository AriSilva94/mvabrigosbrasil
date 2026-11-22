import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";
import {
  isEmailNotVerifiedError,
  isInvalidPasswordError,
  readPendingVerificationEmail,
  rememberPendingVerificationEmail,
} from "@/lib/auth/emailVerification";

describe("pending verification e-mail", () => {
  it("round-trips through sessionStorage", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    });

    rememberPendingVerificationEmail("maria@example.com");

    expect(readPendingVerificationEmail()).toBe("maria@example.com");
    vi.unstubAllGlobals();
  });

  it("does not throw when storage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });

    expect(() => rememberPendingVerificationEmail("a@b.com")).not.toThrow();
    expect(readPendingVerificationEmail()).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("isInvalidPasswordError", () => {
  it("is true only for the 400 INVALID_PASSWORD response", () => {
    expect(
      isInvalidPasswordError(
        new ApiError(400, "Senha incorreta.", { code: "INVALID_PASSWORD" }),
      ),
    ).toBe(true);
    expect(
      isInvalidPasswordError(
        new ApiError(400, "Link inválido ou expirado", {
          error: "Link inválido ou expirado",
        }),
      ),
    ).toBe(false);
    expect(isInvalidPasswordError(new Error("rede"))).toBe(false);
  });
});

describe("isEmailNotVerifiedError", () => {
  it("is true for the 403 EMAIL_NOT_VERIFIED response", () => {
    const error = new ApiError(403, "E-mail não verificado.", {
      error: "E-mail não verificado.",
      code: "EMAIL_NOT_VERIFIED",
    });

    expect(isEmailNotVerifiedError(error)).toBe(true);
  });

  it("is false for a 403 without the code", () => {
    expect(
      isEmailNotVerifiedError(new ApiError(403, "Sem permissão", { error: "x" })),
    ).toBe(false);
  });

  it("is false for the generic 401 of wrong credentials", () => {
    const error = new ApiError(401, "E-mail ou senha inválidos.", {
      error: "E-mail ou senha inválidos.",
    });

    expect(isEmailNotVerifiedError(error)).toBe(false);
  });

  it("is false for non-API errors and null bodies", () => {
    expect(isEmailNotVerifiedError(new Error("rede"))).toBe(false);
    expect(isEmailNotVerifiedError(new ApiError(403, "x"))).toBe(false);
    expect(isEmailNotVerifiedError(null)).toBe(false);
  });
});
