import wpPostsRaw from "@/data/wp/wp_posts.json";
import wpPostMetaRaw from "@/data/wp/wp_postmeta.json";
import type {
  DatabaseDataset,
  MovementRecord,
  ShelterRecord,
  WpPost,
  WpPostMeta,
} from "@/types/database.types";

type WpExportTable<T> = {
  type: string;
  name: string;
  data: T[];
};

const ALL_POSTS = getTableData<WpPost>(wpPostsRaw, "wp_posts");
const ALL_POST_META = getTableData<WpPostMeta>(wpPostMetaRaw, "wp_postmeta");

// Posts de dinâmica presentes no dump mas que não são exibidos no site original
// (registros apenas de gatos em 2025-09/10 que inflavam Saída por Tipo de Abrigo - Privado).
const EXCLUDED_MOVEMENT_IDS = new Set<string>(["2829", "2900"]);

function getTableData<T>(raw: unknown, tableName: string): T[] {
  if (!Array.isArray(raw)) return [];
  const table = raw.find(
    (item) => typeof item === "object" && item !== null && (item as { name?: string }).name === tableName
  ) as WpExportTable<T> | undefined;

  return table?.data ?? [];
}

function parseYear(date: string): number {
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : 0;
}

function parseMonth(date: string): number {
  const month = Number.parseInt(date.slice(5, 7), 10);
  return Number.isFinite(month) ? month : 1;
}

function parseMetaNumber(value: string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const normalized = String(value).replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildMetaLookup(meta: WpPostMeta[]): Map<string, Record<string, string | null>> {
  const lookup = new Map<string, Record<string, string | null>>();

  meta.forEach((entry) => {
    if (entry.meta_key.startsWith("_")) return;
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

export function loadDatabaseDataset(): DatabaseDataset {
  const metaLookup = buildMetaLookup(ALL_POST_META);

  const shelters: ShelterRecord[] = ALL_POSTS.filter(
    (post) => post.post_type === "abrigo" && post.post_status === "publish"
  ).map((post) => {
    const meta = metaLookup.get(post.ID) ?? {};

    return {
      id: Number.parseInt(post.ID, 10),
      title: post.post_title,
      postDate: post.post_date,
      year: parseYear(post.post_date),
      month: parseMonth(post.post_date),
      state: normalizeState(meta.estado),
      type: meta.tipo?.trim(),
    };
  });

  const shelterLookup = new Map<number, ShelterRecord>();
  shelters.forEach((shelter) => shelterLookup.set(shelter.id, shelter));

  const movements: MovementRecord[] = ALL_POSTS.filter(
    (post) =>
      post.post_type === "dinamica" &&
      post.post_status === "publish" &&
      !EXCLUDED_MOVEMENT_IDS.has(post.ID)
  ).map((post) => {
    const meta = metaLookup.get(post.ID) ?? {};
    const parsedShelterId = meta.id_abrigo ? Number.parseInt(meta.id_abrigo, 10) : Number.NaN;
    const shelterId = Number.isFinite(parsedShelterId) ? parsedShelterId : null;
    const shelter = shelterId !== null ? shelterLookup.get(shelterId) : undefined;

    return {
      id: Number.parseInt(post.ID, 10),
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
