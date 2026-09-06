import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { verifySessionToken } from "@/lib/auth/session";
import { proxy } from "../../../proxy";

const secret = "test-secret-test-secret-test-secret-test-secret";
const key = new TextEncoder().encode(secret);
const originalSecret = process.env.AUTH_JWT_SECRET;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.AUTH_JWT_SECRET = originalSecret;
});

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
});

describe("proxy refresh", () => {
  it("forwards the full Cookie header and every clearing Set-Cookie header", async () => {
    process.env.AUTH_JWT_SECRET = secret;
    const responseHeaders = new Headers();
    responseHeaders.append("set-cookie", "mv_at=; Path=/; Max-Age=0; HttpOnly");
    responseHeaders.append("set-cookie", "mv_rt=; Path=/; Max-Age=0; HttpOnly");
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: "Sessão expirada" }), {
        status: 401,
        headers: responseHeaders,
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const request = new NextRequest("http://localhost:3000/painel?tab=overview", {
      headers: { cookie: "consent=yes; mv_rt=refresh-token" },
    });

    const response = await proxy(request);

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/auth/refresh",
      expect.objectContaining({
        method: "POST",
        headers: { cookie: "consent=yes; mv_rt=refresh-token" },
      }),
    );
    expect(response.headers.getSetCookie()).toEqual([
      "mv_at=; Path=/; Max-Age=0; HttpOnly",
      "mv_rt=; Path=/; Max-Age=0; HttpOnly",
    ]);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });
});
