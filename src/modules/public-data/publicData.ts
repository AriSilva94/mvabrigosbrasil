import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import type { DatabaseDataset } from "@/types/database.types";

const mapStatisticsSchema = z.object({
  byState: z.array(z.object({ state: z.string(), count: z.number() })),
  byType: z.object({
    total: z.number(),
    public: z.number(),
    private: z.number(),
    mixed: z.number(),
    temporary: z.number(),
  }),
});

const metricsSchema = z.object({
  entradas: z.number(), entradasGatos: z.number(),
  adocoes: z.number(), adocoesGatos: z.number(),
  devolucoes: z.number(), devolucoesGatos: z.number(),
  eutanasias: z.number(), eutanasiasGatos: z.number(),
  mortesNaturais: z.number(), mortesNaturaisGatos: z.number(),
  retornoTutor: z.number(), retornoTutorGatos: z.number(),
  retornoLocal: z.number(), retornoLocalGatos: z.number(),
});

const datasetSchema = z.object({
  shelters: z.array(z.object({
    id: z.number(), title: z.string(), postDate: z.string(),
    year: z.number(), month: z.number(), state: z.string().optional(),
    type: z.string().optional(),
  })),
  movements: z.array(z.object({
    id: z.number(), postType: z.enum(["dinamica", "dinamica_lar"]),
    year: z.number(), month: z.number(), shelterId: z.number().nullable(),
    shelterState: z.string().optional(), shelterType: z.string().optional(),
    metrics: metricsSchema,
  })),
  years: z.array(z.number()),
  states: z.array(z.string()),
});

export type MapStatistics = z.infer<typeof mapStatisticsSchema>;

export function parseMapStatistics(value: unknown): MapStatistics {
  const result = mapStatisticsSchema.safeParse(value);
  if (!result.success) throw new TypeError("Resposta inválida do mapa.", { cause: result.error });
  return result.data;
}

export function parseDatabaseDataset(value: unknown): DatabaseDataset {
  const result = datasetSchema.safeParse(value);
  if (!result.success) throw new TypeError("Resposta inválida do banco de dados.", { cause: result.error });
  return result.data;
}

export async function loadPublicMapStatistics(signal?: AbortSignal) {
  return parseMapStatistics(
    await apiClient<unknown>("/public/map-statistics", { signal }),
  );
}
