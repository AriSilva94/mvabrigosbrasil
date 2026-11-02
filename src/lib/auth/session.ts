import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

import type { RegisterType } from "@/constants/registerTypes";

export interface SessionClaims extends JWTPayload {
  sub: string;
  email: string;
  role: RegisterType | null;
  isTeamOnly: boolean;
  teamDisabled: boolean;
  creatorProfileId: string | null;
  sid: string;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionClaims | null> {
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify<SessionClaims>(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get("mv_at")?.value;
  if (!token) return null;

  return verifySessionToken(token, process.env.AUTH_JWT_SECRET ?? "");
}
