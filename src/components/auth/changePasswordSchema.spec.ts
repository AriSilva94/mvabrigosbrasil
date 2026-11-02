import { describe, expect, it } from "vitest";

import { changePasswordSchema } from "./changePasswordSchema";

describe("changePasswordSchema", () => {
  it("accepts a short current password from legacy WordPress accounts", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "abc",
      newPassword: "novaSenha1",
      confirmNewPassword: "novaSenha1",
    });

    expect(result.success).toBe(true);
  });

  it("requires the current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "novaSenha1",
      confirmNewPassword: "novaSenha1",
    });

    expect(result.error?.issues[0]).toMatchObject({
      path: ["currentPassword"],
      message: "Informe a senha atual.",
    });
  });

  it("keeps the minimum length for the new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "abc",
      newPassword: "12345",
      confirmNewPassword: "12345",
    });

    expect(result.error?.issues[0]?.path).toEqual(["newPassword"]);
  });
});
