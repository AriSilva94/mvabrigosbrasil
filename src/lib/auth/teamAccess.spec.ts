import { describe, expect, it } from "vitest";

import { REGISTER_TYPES } from "@/constants/registerTypes";
import type { SessionClaims } from "@/lib/auth/session";
import {
  ADMIN_ALLOWED_PATHS,
  TEAM_ALLOWED_PATHS,
  filterPanelShortcuts,
  getAccessRedirect,
  mapSessionClaimsToUserAccess,
  type UserAccessInfo,
} from "@/lib/auth/teamAccess";

function claims(overrides: Partial<SessionClaims> = {}): SessionClaims {
  return {
    sub: "user-1",
    email: "pessoa@example.com",
    role: REGISTER_TYPES.shelter,
    isTeamOnly: false,
    teamDisabled: false,
    creatorProfileId: null,
    sid: "session-1",
    ...overrides,
  };
}

function access(overrides: Partial<UserAccessInfo> = {}): UserAccessInfo {
  return {
    userId: "user-1",
    email: "pessoa@example.com",
    registerType: REGISTER_TYPES.shelter,
    isTeamOnly: false,
    isTeamDisabled: false,
    creatorProfileId: null,
    ...overrides,
  };
}

describe("mapSessionClaimsToUserAccess", () => {
  it("maps every protected-session claim to UserAccessInfo", () => {
    expect(
      mapSessionClaimsToUserAccess(
        claims({
          sub: "team-user",
          email: "equipe@example.com",
          role: REGISTER_TYPES.manager,
          isTeamOnly: true,
          teamDisabled: true,
          creatorProfileId: "creator-1",
        }),
      ),
    ).toEqual({
      userId: "team-user",
      email: "equipe@example.com",
      registerType: REGISTER_TYPES.manager,
      isTeamOnly: true,
      isTeamDisabled: true,
      creatorProfileId: "creator-1",
    });
  });
});

describe("getAccessRedirect", () => {
  it("preserves the exact team and admin path lists", () => {
    expect(TEAM_ALLOWED_PATHS).toEqual(["/painel", "/dinamica-populacional"]);
    expect(ADMIN_ALLOWED_PATHS).toEqual([
      "/painel",
      "/admin/gerentes",
      "/admin/abrigos",
    ]);
  });

  it.each([
    REGISTER_TYPES.shelter,
    REGISTER_TYPES.volunteer,
    REGISTER_TYPES.manager,
    null,
  ])("allows normal role %s on unrestricted protected paths", (registerType) => {
    expect(getAccessRedirect("/minhas-vagas", access({ registerType }))).toBeNull();
  });

  it.each([
    "/painel",
    "/admin/gerentes",
    "/admin/gerentes/manager-1",
    "/admin/abrigos",
  ])("allows admins on %s", (pathname) => {
    expect(
      getAccessRedirect(
        pathname,
        access({ registerType: REGISTER_TYPES.admin }),
      ),
    ).toBeNull();
  });

  it("redirects admins away from non-admin protected paths", () => {
    expect(
      getAccessRedirect(
        "/meu-cadastro",
        access({ registerType: REGISTER_TYPES.admin }),
      ),
    ).toBe("/painel");
  });

  it.each([
    "/painel",
    "/dinamica-populacional",
    "/dinamica-populacional/abrigo-1",
  ])("allows active team-only users on %s", (pathname) => {
    expect(
      getAccessRedirect(pathname, access({ isTeamOnly: true })),
    ).toBeNull();
  });

  it("redirects active team-only users away from other protected paths", () => {
    expect(
      getAccessRedirect("/vagas", access({ isTeamOnly: true })),
    ).toBe("/painel");
  });

  it("allows disabled team-only users to see only the panel", () => {
    const disabledTeam = access({ isTeamOnly: true, isTeamDisabled: true });

    expect(getAccessRedirect("/painel", disabledTeam)).toBeNull();
    expect(getAccessRedirect("/dinamica-populacional", disabledTeam)).toBe(
      "/painel",
    );
  });
});

describe("filterPanelShortcuts", () => {
  const shortcuts = [{ id: "profile" }, { id: "dynamic-data" }] as const;

  it("keeps all shortcuts for normal users", () => {
    expect(filterPanelShortcuts(shortcuts, false)).toBe(shortcuts);
  });

  it("keeps only population dynamics for team-only users", () => {
    expect(filterPanelShortcuts(shortcuts, true)).toEqual([
      { id: "dynamic-data" },
    ]);
  });
});
