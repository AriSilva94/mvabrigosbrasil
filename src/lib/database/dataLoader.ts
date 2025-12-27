import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import type { Database } from "@/lib/supabase/types";
import type { DatabaseDataset, MovementRecord, ShelterRecord } from "@/types/database.types";

dayjs.extend(customParseFormat);

type WpPostRow = Database["public"]["Tables"]["wp_posts_raw"]["Row"];
type WpPostMetaRow = Database["public"]["Tables"]["wp_postmeta_raw"]["Row"];

type FetchWpDataResult = {
  posts: WpPostRow[];
  meta: WpPostMetaRow[];
};

const META_KEYS = [
  "estado",
  "tipo",
  "id_abrigo",
  "entradas_de_animais",
  "entradas_de_gatos",
  "adocoes_de_animais",
  "adocoes_de_gatos",
  "devolucoes_de_animais",
  "devolucoes_de_gatos",
  "eutanasias_de_animais",
  "eutanasias_de_gatos",
  "mortes_naturais_de_animais",
  "mortes_naturais_de_gatos",
  "retorno_de_caes",
  "retorno_de_gatos",
  "retorno_local_caes",
  "retorno_local_gatos",
];

function parseDate(date: string | null | undefined) {
  if (!date) return dayjs.invalid();

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

  return dayjs.invalid();
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

function buildMetaLookup(meta: WpPostMetaRow[]): Map<number, Record<string, string | null>> {
  const lookup = new Map<number, Record<string, string | null>>();

  meta.forEach((entry) => {
    if (!entry.meta_key || entry.meta_key.startsWith("_")) return;
    if (entry.post_id === null || entry.post_id === undefined) return;
    const current = lookup.get(entry.post_id) ?? {};
    current[entry.meta_key] = entry.meta_value;
    lookup.set(entry.post_id, current);
  });

  return lookup;
}

function normalizeState(state: string | null | undefined): string | undefined {
  const trimmed = state?.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

async function fetchWpData(): Promise<FetchWpDataResult> {
  const supabase = getSupabaseAdminClient();

  async function fetchAllRows<T>(
    table: keyof Database["public"]["Tables"],
    select: string,
    configure?: (query: ReturnType<typeof supabase["from"]>) => ReturnType<typeof supabase["from"]>,
    pageSize = 1000
  ): Promise<T[]> {
    const rows: T[] = [];
    let from = 0;

    // Paginate to avoid default Supabase row limits.
    // Stop when a page returns fewer items than requested.
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

  const posts = await fetchAllRows<WpPostRow>("wp_posts_raw", "*");
  const meta = await fetchAllRows<WpPostMetaRow>("wp_postmeta_raw", "*");

  return { posts, meta };
}

export async function loadDatabaseDataset(): Promise<DatabaseDataset> {
  const { posts, meta } = await fetchWpData();
  const metaLookup = buildMetaLookup(meta);

  const shelters: ShelterRecord[] = posts
    .filter((post) => post.post_type === "abrigo")
    .map((post) => {
      const meta = metaLookup.get(post.id) ?? {};

      return {
        id: Number.isFinite(post.id) ? post.id : 0,
        title: post.post_title ?? "",
        postDate: post.post_date ?? "",
        year: parseYear(post.post_date ?? ""),
        month: parseMonth(post.post_date ?? ""),
        state: normalizeState(meta.estado),
        type: meta.tipo?.trim(),
      };
    });

  const shelterLookup = new Map<number, ShelterRecord>();
  shelters.forEach((shelter) => shelterLookup.set(shelter.id, shelter));

  const movements: MovementRecord[] = posts
    .filter((post) => post.post_type === "dinamica" || post.post_type === "dinamica_lar")
    .map((post) => {
      const meta = metaLookup.get(post.id) ?? {};
      const parsedShelterId = meta.id_abrigo ? Number.parseInt(meta.id_abrigo, 10) : Number.NaN;
      const shelterId = Number.isFinite(parsedShelterId) ? parsedShelterId : null;
      const shelter = shelterId !== null ? shelterLookup.get(shelterId) : undefined;

      return {
        id: Number.isFinite(post.id) ? post.id : 0,
        postType: post.post_type as MovementRecord["postType"],
        year: parseYear(post.post_date),
        month: parseMonth(post.post_date),
        shelterId,
        shelterState: shelter?.state,
        shelterType: shelter?.type,
        metrics: {
          entradas: parseMetaNumber(meta.entradas_de_animais),
          entradasGatos: parseMetaNumber(meta.entradas_de_gatos),
          adocoes: parseMetaNumber(meta.adocoes_de_animais),
          adocoesGatos: parseMetaNumber(meta.adocoes_de_gatos),
          devolucoes: parseMetaNumber(meta.devolucoes_de_animais),
          devolucoesGatos: parseMetaNumber(meta.devolucoes_de_gatos),
          eutanasias: parseMetaNumber(meta.eutanasias_de_animais),
          eutanasiasGatos: parseMetaNumber(meta.eutanasias_de_gatos),
          mortesNaturais: parseMetaNumber(meta.mortes_naturais_de_animais),
          mortesNaturaisGatos: parseMetaNumber(meta.mortes_naturais_de_gatos),
          retornoTutor:
            parseMetaNumber(meta.retorno_de_caes) + parseMetaNumber(meta.retorno_de_gatos),
          retornoTutorGatos: parseMetaNumber(meta.retorno_de_gatos),
          retornoLocal:
            parseMetaNumber(meta.retorno_local_caes) +
            parseMetaNumber(meta.retorno_local_gatos),
          retornoLocalGatos: parseMetaNumber(meta.retorno_local_gatos),
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
