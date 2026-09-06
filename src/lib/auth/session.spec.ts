import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import { verifySessionToken } from "@/lib/auth/session";

const secret = "test-secret-test-secret-test-secret-test-secret";
const key = new TextEncoder().encode(secret);

async function tokenWithExpiration(expirationTime: number) {
  return new SignJWT({
    email: "admin@example.com",
    role: "admin",
    isTeamOnly: false,
    teamDisabled: false,
    creatorProfileId: null,
    sid: "session-1",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-1")
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(key);
}

describe("verifySessionToken", () => {
  it("returns claims for a valid JWT", async () => {
    const token = await tokenWithExpiration(Math.floor(Date.now() / 1000) + 60);

    await expect(verifySessionToken(token, secret)).resolves.toMatchObject({
      sub: "user-1",
      email: "admin@example.com",
      role: "admin",
      sid: "session-1",
    });
  });

  it("returns null for an expired JWT", async () => {
    const token = await tokenWithExpiration(Math.floor(Date.now() / 1000) - 1);

    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });

  it("returns null for a malformed JWT", async () => {
    await expect(verifySessionToken("not-a-jwt", secret)).resolves.toBeNull();
  });

  it("returns null for a JWT signed with another secret", async () => {
    const token = await tokenWithExpiration(Math.floor(Date.now() / 1000) + 60);

    await expect(
      verifySessionToken(token, "another-secret-another-secret-another-secret"),
    ).resolves.toBeNull();
  });

  it("rejects a signed JWT that does not use HS256", async () => {
    const token = await new SignJWT({ email: "admin@example.com" })
      .setProtectedHeader({ alg: "HS384" })
      .setSubject("user-1")
      .setExpirationTime("1m")
      .sign(key);

    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });
});
