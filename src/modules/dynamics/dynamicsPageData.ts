import "server-only";

import { REGISTER_TYPES } from "@/constants/registerTypes";
import {
  enforceTeamAccess,
  type UserAccessInfo,
} from "@/lib/auth/teamAccess";
import type { PopulationUserSummary } from "@/app/(protected)/dinamica-populacional/types";
import {
  loadDynamicsSummary,
  loadManagerDynamicsSummary,
} from "./dynamicsSummary";

type PopulationDynamicsPageData = {
  access: UserAccessInfo;
  userSummary: PopulationUserSummary;
};

const PRISMA_INT_MAX = 2_147_483_647;
const PRISMA_INT_MIN = -2_147_483_648;

export function parseShelterWpPostIdParam(value: string): number | null {
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) &&
    parsed !== 0 &&
    parsed >= PRISMA_INT_MIN &&
    parsed <= PRISMA_INT_MAX
    ? parsed
    : null;
}

export async function loadPopulationDynamicsPageData(): Promise<PopulationDynamicsPageData> {
  const access = await enforceTeamAccess("/dinamica-populacional");
  const { summary } = await loadDynamicsSummary();
  return { access, userSummary: summary };
}

export async function loadManagerPopulationDynamicsPageData(
  shelterIdParam: string,
  shelterWpPostId: number,
): Promise<PopulationDynamicsPageData | null> {
  const access = await enforceTeamAccess(
    `/dinamica-populacional/${shelterIdParam}`,
  );
  if (access.registerType !== REGISTER_TYPES.manager) return null;

  const result = await loadManagerDynamicsSummary(shelterWpPostId);
  return result ? { access, userSummary: result.summary } : null;
}
