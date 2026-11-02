import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { config, proxy } from "./src/proxy";

const secret = "test-secret-test-secret-test-secret-test-secret";
const key = new TextEncoder().encode(secret);
const originalInternalApiUrl = process.env.INTERNAL_API_URL;
const originalSecret = process.env.AUTH_JWT_SECRET;

async function accessToken(expirationTime: number): Promise<string> {
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

function nextRequest(
  path: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, init);
}

function expectPassThrough(response: Response): void {
  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(response.headers.get("location")).toBeNull();
}

beforeEach(() => {
  process.env.AUTH_JWT_SECRET = secret;
  process.env.INTERNAL_API_URL = "http://localhost:3001/";
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.AUTH_JWT_SECRET = originalSecret;
  process.env.INTERNAL_API_URL = originalInternalApiUrl;
});

describe("proxy refresh", () => {
  it("redirects an expired session to the exact original URL and forwards all cookies", async () => {
    const expired = await accessToken(Math.floor(Date.now() / 1000) - 1);
    const responseHeaders = new Headers();
    responseHeaders.append("set-cookie", "mv_at=new-access; Path=/; HttpOnly");
    responseHeaders.append("set-cookie", "mv_rt=new-refresh; Path=/; HttpOnly");
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: responseHeaders,
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const cookie = `consent=yes; mv_at=${expired}; mv_rt=refresh-token`;

    const response = await proxy(
      nextRequest("/painel?tab=overview&sort=recent", {
        headers: { cookie },
      }),
    );

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/auth/refresh",
      expect.objectContaining({ method: "POST", headers: { cookie } }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/painel?tab=overview&sort=recent",
    );
    expect(response.headers.getSetCookie()).toEqual([
      "mv_at=new-access; Path=/; HttpOnly",
      "mv_rt=new-refresh; Path=/; HttpOnly",
    ]);
  });

  it("forwards clearing cookies and redirects a protected request after failed refresh", async () => {
    const responseHeaders = new Headers();
    responseHeaders.append("set-cookie", "mv_at=; Path=/; Max-Age=0; HttpOnly");
    responseHeaders.append("set-cookie", "mv_rt=; Path=/; Max-Age=0; HttpOnly");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ error: "Sessão expirada" }), {
          status: 401,
          headers: responseHeaders,
        }),
      ),
    );

    const response = await proxy(
      nextRequest("/painel", { headers: { cookie: "mv_rt=expired" } }),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(response.headers.getSetCookie()).toEqual([
      "mv_at=; Path=/; Max-Age=0; HttpOnly",
      "mv_rt=; Path=/; Max-Age=0; HttpOnly",
    ]);
  });

  it("passes through a public unauthenticated request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);

    const response = await proxy(nextRequest("/quem-somos"));

    expectPassThrough(response);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("passes through a public request after failed refresh", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: "Sessão expirada" }), { status: 401 }),
    );
    vi.stubGlobal("fetch", fetcher);

    const response = await proxy(
      nextRequest("/quem-somos", { headers: { cookie: "mv_rt=expired" } }),
    );

    expectPassThrough(response);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("passes through a valid access session without refreshing", async () => {
    const token = await accessToken(Math.floor(Date.now() / 1000) + 60);
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);

    const response = await proxy(
      nextRequest("/painel", { headers: { cookie: `mv_at=${token}` } }),
    );

    expectPassThrough(response);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "passes through %s requests without session handling",
    async (method) => {
      const fetcher = vi.fn<typeof fetch>();
      vi.stubGlobal("fetch", fetcher);

      const response = await proxy(
        nextRequest("/painel", {
          method,
          headers: { cookie: "mv_rt=refresh-token" },
        }),
      );

      expectPassThrough(response);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
});

describe("proxy matcher", () => {
  it("excludes only Nest API routes while preserving legacy API handling", () => {
    expect(config.matcher).toEqual([
      "/((?!api/v1(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]);
  });
});
