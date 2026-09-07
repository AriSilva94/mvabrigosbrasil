import { z } from "zod";

import type {
  DynamicsDisplay,
  RegisterFormSubmit,
} from "@/app/(protected)/dinamica-populacional/types";
import { apiClient } from "@/lib/api/client";

const nullableNumber = z.number().nullable();
const metricsSchema = z
  .object({
    entriesDogs: nullableNumber,
    entriesCats: nullableNumber,
    returnsDogs: nullableNumber,
    returnsCats: nullableNumber,
    adoptionsDogs: nullableNumber,
    adoptionsCats: nullableNumber,
    euthanasiasDogs: nullableNumber,
    euthanasiasCats: nullableNumber,
    naturalDeathsDogs: nullableNumber,
    naturalDeathsCats: nullableNumber,
    diseasesDogs: nullableNumber,
    diseasesCats: nullableNumber,
    tutorReturnDogs: nullableNumber,
    tutorReturnCats: nullableNumber,
    originReturnDogs: nullableNumber,
    originReturnCats: nullableNumber,
  })
  .strict();

const sectionSchema = z
  .object({
    dynamicType: z.enum(["dinamica", "dinamica_lar"]),
    title: z.string(),
    populationInitial: nullableNumber,
    populationCurrent: nullableNumber,
    populationInitialDogs: nullableNumber.optional(),
    populationInitialCats: nullableNumber.optional(),
    populationCurrentDogs: nullableNumber.optional(),
    populationCurrentCats: nullableNumber.optional(),
    stats: z.array(
      z
        .object({
          key: z.enum(["entry", "exit", "adoption", "mortality", "morbidity"]),
          label: z.string(),
          value: nullableNumber,
          trend: z.enum(["up", "down", "neutral"]),
          helperText: z.string().nullable().optional(),
        })
        .strict(),
    ),
    rows: z.array(
      z
        .object({
          id: z.string(),
          referenceLabel: z.string(),
          referenceDate: z.string().nullable().optional(),
          metrics: metricsSchema,
          balance: nullableNumber,
          cumulativeBalance: nullableNumber,
        })
        .strict(),
    ),
  })
  .strict();

const dynamicsResponseSchema = z
  .object({ sections: z.array(sectionSchema) })
  .strict();

export type DynamicsResponse = { sections: DynamicsDisplay[] };

export function buildDynamicsPath(shelterWpPostId?: number | null): string {
  if (shelterWpPostId === null || shelterWpPostId === undefined) {
    return "/dynamics";
  }
  return `/dynamics?shelter_id=${encodeURIComponent(String(shelterWpPostId))}`;
}

export function parseDynamicsResponse(value: unknown): DynamicsResponse {
  const parsed = dynamicsResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new TypeError("Resposta inválida ao carregar dinâmica populacional.");
  }
  return parsed.data as DynamicsResponse;
}

export function isCurrentDynamicsRequest(
  requestRevision: number,
  currentRevision: number,
  aborted: boolean,
): boolean {
  return !aborted && requestRevision === currentRevision;
}

export async function getDynamics(
  shelterWpPostId?: number | null,
  signal?: AbortSignal,
): Promise<DynamicsResponse> {
  const response = await apiClient<unknown>(buildDynamicsPath(shelterWpPostId), {
    signal,
  });
  return parseDynamicsResponse(response);
}

export async function saveDynamics(
  payload: RegisterFormSubmit,
): Promise<DynamicsResponse> {
  const response = await apiClient<unknown>("/dynamics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseDynamicsResponse(response);
}

export async function deleteDynamics(id: string): Promise<DynamicsResponse> {
  const response = await apiClient<unknown>("/dynamics", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return parseDynamicsResponse(response);
}
