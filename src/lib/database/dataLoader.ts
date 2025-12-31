import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { Database } from "@/lib/supabase/types";
import type { DatabaseDataset, MovementRecord, ShelterRecord } from "@/types/database.types";

dayjs.extend(customParseFormat);

type ShelterRow = Database["public"]["Tables"]["shelters"]["Row"];
type ShelterDynamicsRow = Database["public"]["Tables"]["shelter_dynamics"]["Row"];

function parseDate(date: string | null | undefined) {
  if (!date) return dayjs(Number.NaN);

  const direct = dayjs(date);
  if (direct.isValid()) return direct;

  const formats = [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DDTHH:mm:ss[Z]",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DD",
  ];

  for (const format of formats) {
    const parsed = dayjs(date, format, true);
    if (parsed.isValid()) return parsed;
  }

  return dayjs(Number.NaN);
}

function parseYear(date: string | null | undefined): number {
  const parsed = parseDate(date);
  return parsed.isValid() ? parsed.year() : 0;
}

function parseMonth(date: string | null | undefined): number {
  const parsed = parseDate(date);
  return parsed.isValid() ? parsed.month() + 1 : 1;
}

function parseMetaNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const normalized = String(value).replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeState(state: string | null | undefined): string | undefined {
  const trimmed = state?.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

/**
 * Normaliza o tipo de abrigo da forma armazenada no Supabase para o formato esperado
 * pela aplicação (compatível com o formato legado do WordPress).
 */
function normalizeShelterTypeFromSupabase(shelterType: string | null | undefined): string | undefined {
  if (!shelterType) return undefined;

  const typeMap: Record<string, string> = {
    "public": "Público",
    "private": "Privado",
    "mixed": "Misto",
    "temporary": "LT-PI",
  };

  return typeMap[shelterType] || shelterType;
}

async function fetchSupabaseData(): Promise<{
  shelters: ShelterRow[];
  dynamics: ShelterDynamicsRow[];
}> {
  const supabase = getSupabaseAdminClient();

  async function fetchAllRows<T>(
    table: keyof Database["public"]["Tables"],
    select: string,
    configure?: (query: ReturnType<typeof supabase["from"]>) => ReturnType<typeof supabase["from"]>,
    pageSize = 1000
  ): Promise<T[]> {
    const rows: T[] = [];
    let from = 0;

    for (;;) {
      const to = from + pageSize - 1;
      let query = supabase.from(table as string).select(select).range(from, to);
      if (configure) {
        query = configure(query);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Falha ao carregar ${table}: ${error.message}`);
      }

      const batch = (data ?? []) as T[];
      rows.push(...batch);

      if (batch.length < pageSize) break;
      from += pageSize;
    }

    return rows;
  }

  const shelters = await fetchAllRows<ShelterRow>(
    "shelters",
    "id, wp_post_id, name, state, shelter_type, foundation_date, created_at"
  );

  const dynamics = await fetchAllRows<ShelterDynamicsRow>(
    "shelter_dynamics",
    `
      id,
      shelter_id,
      kind,
      dynamic_type,
      reference_date,
      reference_period,
      entradas_de_animais,
      entradas_de_gatos,
      adocoes_caes,
      adocoes_gatos,
      devolucoes_caes,
      devolucoes_gatos,
      eutanasias_caes,
      eutanasias_gatos,
      mortes_naturais_caes,
      mortes_naturais_gatos,
      retorno_de_caes,
      retorno_de_gatos,
      retorno_local_caes,
      retorno_local_gatos
    `
  );

  return { shelters, dynamics };
}

export async function loadDatabaseDataset(): Promise<DatabaseDataset> {
  const { shelters: shelterRows, dynamics: dynamicsRows } = await fetchSupabaseData();

  // Processar abrigos
  const shelters: ShelterRecord[] = shelterRows.map((shelter): ShelterRecord => {
    // Usar created_at (equivalente ao post_date do WordPress)
    // IMPORTANTE: No sistema legado, year/month são baseados em post_date, não foundation_date
    const dateToUse = String(shelter.created_at ?? "");

    return {
      id: Number(shelter.wp_post_id ?? 0),
      title: shelter.name ?? "",
      postDate: dateToUse,
      year: parseYear(dateToUse),
      month: parseMonth(dateToUse),
      state: normalizeState(shelter.state),
      type: normalizeShelterTypeFromSupabase(shelter.shelter_type),
    };
  });

  // Criar lookup de shelter_id (UUID) -> ShelterRecord
  const shelterLookupByUuid = new Map<string, ShelterRecord>();
  shelterRows.forEach((shelterRow) => {
    const shelterRecord = shelters.find((s) => s.id === shelterRow.wp_post_id);
    if (shelterRecord) {
      shelterLookupByUuid.set(shelterRow.id, shelterRecord);
    }
  });

  // Processar dinâmicas
  // Nota: Como a tabela shelter_dynamics não tem wp_post_id, usamos um ID hash baseado
  // na combinação shelter_id + reference_period + dynamic_type para garantir unicidade
  const movements: MovementRecord[] = dynamicsRows.map((dynamic, index) => {
    const shelter = shelterLookupByUuid.get(dynamic.shelter_id);

    // Gerar um ID numérico único baseado no hash da string
    // Isso mantém compatibilidade com o sistema legado que espera IDs numéricos
    const hashString = `${dynamic.shelter_id}-${dynamic.reference_period}-${dynamic.dynamic_type}`;
    const id = Math.abs(hashString.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0));

    return {
      id,
      postType: (dynamic.dynamic_type === "dinamica_lar" ? "dinamica_lar" : "dinamica") as MovementRecord["postType"],
      year: parseYear(dynamic.reference_date),
      month: parseMonth(dynamic.reference_date),
      shelterId: shelter?.id ?? null,
      shelterState: shelter?.state,
      shelterType: shelter?.type,
      metrics: {
        entradas: parseMetaNumber(dynamic.entradas_de_animais),
        entradasGatos: parseMetaNumber(dynamic.entradas_de_gatos),
        adocoes: parseMetaNumber(dynamic.adocoes_caes),
        adocoesGatos: parseMetaNumber(dynamic.adocoes_gatos),
        devolucoes: parseMetaNumber(dynamic.devolucoes_caes),
        devolucoesGatos: parseMetaNumber(dynamic.devolucoes_gatos),
        eutanasias: parseMetaNumber(dynamic.eutanasias_caes),
        eutanasiasGatos: parseMetaNumber(dynamic.eutanasias_gatos),
        mortesNaturais: parseMetaNumber(dynamic.mortes_naturais_caes),
        mortesNaturaisGatos: parseMetaNumber(dynamic.mortes_naturais_gatos),
        retornoTutor:
          parseMetaNumber(dynamic.retorno_de_caes) + parseMetaNumber(dynamic.retorno_de_gatos),
        retornoTutorGatos: parseMetaNumber(dynamic.retorno_de_gatos),
        retornoLocal:
          parseMetaNumber(dynamic.retorno_local_caes) +
          parseMetaNumber(dynamic.retorno_local_gatos),
        retornoLocalGatos: parseMetaNumber(dynamic.retorno_local_gatos),
      },
    };
  });

  const years = Array.from(
    new Set([...shelters.map((item) => item.year), ...movements.map((item) => item.year)])
  )
    .filter((year) => Number.isFinite(year) && year > 0)
    .sort((a, b) => b - a);

  const states = Array.from(
    new Set(shelters.map((shelter) => shelter.state).filter(Boolean) as string[])
  ).sort();

  return {
    shelters,
    movements,
    years,
    states,
  };
}
