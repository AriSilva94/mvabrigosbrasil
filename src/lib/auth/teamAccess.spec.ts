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

  const roleMatrix = [
    {
      label: "admin",
      value: access({ registerType: REGISTER_TYPES.admin }),
      redirects: {
        "/painel": null,
        "/admin/gerentes": null,
        "/admin/gerentes/manager-1": null,
        "/admin/abrigos": null,
        "/equipe": "/painel",
        "/dinamica-populacional": "/painel",
        "/minhas-vagas": "/painel",
      },
    },
    {
      label: "manager",
      value: access({ registerType: REGISTER_TYPES.manager }),
      redirects: {
        "/painel": null,
        "/admin/gerentes": "/painel",
        "/admin/abrigos": "/painel",
        "/equipe": "/painel",
        "/dinamica-populacional": null,
        "/minhas-vagas": null,
      },
    },
    {
      label: "shelter",
      value: access({ registerType: REGISTER_TYPES.shelter }),
      redirects: {
        "/painel": null,
        "/admin/gerentes": "/painel",
        "/admin/abrigos": "/painel",
        "/equipe": null,
        "/dinamica-populacional": null,
        "/minhas-vagas": null,
      },
    },
    {
      label: "volunteer",
      value: access({ registerType: REGISTER_TYPES.volunteer }),
      redirects: {
        "/painel": null,
        "/admin/gerentes": "/painel",
        "/admin/abrigos": "/painel",
        "/equipe": "/painel",
        "/dinamica-populacional": null,
        "/minhas-vagas": null,
      },
    },
    {
      label: "active team-only",
      value: access({ isTeamOnly: true, creatorProfileId: "creator-1" }),
      redirects: {
        "/painel": null,
        "/admin/gerentes": "/painel",
        "/admin/abrigos": "/painel",
        "/equipe": "/painel",
        "/dinamica-populacional": null,
        "/dinamica-populacional/abrigo-1": null,
        "/minhas-vagas": "/painel",
      },
    },
    {
      label: "disabled team-only",
      value: access({
        isTeamOnly: true,
        isTeamDisabled: true,
        creatorProfileId: "creator-1",
      }),
      redirects: {
        "/painel": null,
        "/admin/gerentes": "/painel",
        "/admin/abrigos": "/painel",
        "/equipe": "/painel",
        "/dinamica-populacional": "/painel",
        "/dinamica-populacional/abrigo-1": "/painel",
        "/minhas-vagas": "/painel",
      },
    },
  ] as const;

  it.each(roleMatrix)(
    "applies the exact protected-path matrix for $label",
    ({ value, redirects }) => {
      for (const [pathname, expected] of Object.entries(redirects)) {
        expect(getAccessRedirect(pathname, value), pathname).toBe(expected);
      }
    },
  );
});

describe("filterPanelShortcuts", () => {
  const shortcuts = [
    { id: "profile" },
    { id: "dynamic-data" },
    { id: "team" },
  ] as const;

  it.each([
    ["admin", false],
    ["manager", false],
    ["shelter", false],
    ["volunteer", false],
  ] as const)("keeps every shortcut for normal %s access", (_, isTeamOnly) => {
    expect(filterPanelShortcuts(shortcuts, isTeamOnly)).toBe(shortcuts);
  });

  it.each(["active team-only", "disabled team-only"])(
    "keeps only population dynamics for %s access",
    () => {
      expect(filterPanelShortcuts(shortcuts, true)).toEqual([
        { id: "dynamic-data" },
      ]);
    },
  );
});
