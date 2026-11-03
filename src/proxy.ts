import { NextRequest, NextResponse } from "next/server";

import { withInternalToken } from "@/lib/api/internalToken";
import { verifySessionToken } from "@/lib/auth/session";

const PROTECTED_PATHS = [
  "/admin",
  "/alterar-senha",
  "/conteudos-exclusivos",
  "/dinamica-populacional",
  "/equipe",
  "/meu-cadastro",
  "/minhas-vagas",
  "/painel",
  "/treinamentos",
  "/vagas",
  "/voluntarios",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function loginRedirect(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("mv_at")?.value;
  const session = accessToken
    ? await verifySessionToken(accessToken, process.env.AUTH_JWT_SECRET ?? "")
    : null;

  if (session) return NextResponse.next();

  const refreshToken = request.cookies.get("mv_rt")?.value;
  if (refreshToken) {
    const origin = (
      process.env.INTERNAL_API_URL ?? "http://localhost:3001"
    ).replace(/\/+$/, "");
    const cookieHeader = request.headers.get("cookie");
    let refreshResponse: Response | null = null;

    try {
      refreshResponse = await fetch(`${origin}/api/v1/auth/refresh`, {
        method: "POST",
        headers: withInternalToken(
          new Headers(cookieHeader ? { cookie: cookieHeader } : undefined),
        ),
        cache: "no-store",
      });
    } catch {
      refreshResponse = null;
    }

    const response = refreshResponse?.ok
      ? NextResponse.redirect(request.url)
      : isProtectedPath(request.nextUrl.pathname)
        ? loginRedirect(request)
        : NextResponse.next();

    if (refreshResponse) {
      for (const cookie of refreshResponse.headers.getSetCookie()) {
        response.headers.append("set-cookie", cookie);
      }
    }

    return response;
  }

  return isProtectedPath(request.nextUrl.pathname)
    ? loginRedirect(request)
    : NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/v1(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
