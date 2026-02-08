import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_CONSENT_NAME,
  COOKIE_MAX_AGE,
  serializeConsent,
  type CookieConsentValue,
} from "@/lib/cookies/consent";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CookieConsentValue;

    if (typeof body.analytics !== "boolean" || typeof body.marketing !== "boolean" || typeof body.thirdPartyEmbeds !== "boolean") {
      return NextResponse.json({ error: "Campos inválidos" }, { status: 400 });
    }

    const consent: CookieConsentValue = {
      v: body.v,
      necessary: true,
      analytics: body.analytics,
      marketing: body.marketing,
      thirdPartyEmbeds: body.thirdPartyEmbeds,
    };

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_CONSENT_NAME, serializeConsent(consent), {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: isProduction,
      httpOnly: false,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_CONSENT_NAME);
  return response;
}
