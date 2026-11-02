import "server-only";

import { z } from "zod";

import type { PopulationUserSummary } from "@/app/(protected)/dinamica-populacional/types";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";

const nullableNumber = z.number().nullable();
const summaryResponseSchema = z
  .object({
    summary: z
      .object({
        displayName: z.string().nullable(),
        totalAnimals: nullableNumber,
        shelterTypeLabel: z.string().nullable(),
        hasTemporaryAgreement: z.boolean(),
        dogsCount: nullableNumber,
        catsCount: nullableNumber,
        totalAnimalsLt: nullableNumber,
        dogsCountLt: nullableNumber,
        catsCountLt: nullableNumber,
      })
      .strict(),
    shelterId: z.string().nullable(),
  })
  .strict();

export type DynamicsSummaryResponse = {
  summary: PopulationUserSummary;
  shelterId: string | null;
};

function parseSummaryResponse(value: unknown): DynamicsSummaryResponse {
  const parsed = summaryResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new TypeError(
      "Resposta inválida ao carregar resumo da dinâmica populacional.",
    );
  }
  return parsed.data;
}

export async function loadDynamicsSummary(): Promise<DynamicsSummaryResponse> {
  const response = await serverApi<unknown>("/dynamics/summary");
  return parseSummaryResponse(response);
}

export async function loadManagerDynamicsSummary(
  shelterWpPostId: number,
): Promise<DynamicsSummaryResponse | null> {
  try {
    const response = await serverApi<unknown>(
      `/dynamics/summary?shelter_id=${encodeURIComponent(String(shelterWpPostId))}`,
    );
    const parsed = parseSummaryResponse(response);
    return parsed.shelterId ? parsed : null;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return null;
    }
    throw error;
  }
}
