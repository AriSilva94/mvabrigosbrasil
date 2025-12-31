import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import type {
  DynamicType,
  DynamicsDisplay,
  DynamicsTableRow,
  RateCardData,
  RegisterFormSubmit,
} from "@/app/(protected)/dinamica-populacional/types";

type AdminClient = SupabaseClient<Database>;

type DynamicsRecord = {
  id: string;
  shelter_id: string;
  dynamic_type: string | null;
  reference_period: string | null;
  reference_date: string;
  kind: string;
  entradas_de_animais: number | null;
  entradas_de_gatos: number | null;
  adocoes_caes: number | null;
  adocoes_gatos: number | null;
  devolucoes_caes: number | null;
  devolucoes_gatos: number | null;
  eutanasias_caes: number | null;
  eutanasias_gatos: number | null;
  mortes_naturais_caes: number | null;
  mortes_naturais_gatos: number | null;
  doencas_caes: number | null;
  doencas_gatos: number | null;
  retorno_de_caes: number | null;
  retorno_de_gatos: number | null;
  retorno_local_caes: number | null;
  retorno_local_gatos: number | null;
};

const MONTH_LABELS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function parseReferenceLabel(reference: string | null): string {
  if (!reference) return "—";
  const cleaned = reference.replace("/", "-");
  const [part1, part2] = cleaned.split("-");
  const hasYearFirst = part1.length === 4;
  const year = hasYearFirst ? part1 : part2;
  const month = hasYearFirst ? part2 : part1;
  const monthIndex = Number.parseInt(month, 10) - 1;
  const monthLabel = MONTH_LABELS[monthIndex] ?? month;
  return `${monthLabel}/${year}`;
}

function computeBalance(metrics: DynamicsTableRow["metrics"]): number {
  const entries = (metrics.entriesDogs ?? 0) + (metrics.entriesCats ?? 0);
  const exits =
    (metrics.adoptionsDogs ?? 0) +
    (metrics.adoptionsCats ?? 0) +
    (metrics.returnsDogs ?? 0) +
    (metrics.returnsCats ?? 0) +
    (metrics.tutorReturnDogs ?? 0) +
    (metrics.tutorReturnCats ?? 0) +
    (metrics.originReturnDogs ?? 0) +
    (metrics.originReturnCats ?? 0) +
    (metrics.euthanasiasDogs ?? 0) +
    (metrics.euthanasiasCats ?? 0) +
    (metrics.naturalDeathsDogs ?? 0) +
    (metrics.naturalDeathsCats ?? 0);
  return entries - exits;
}

function deriveDynamicType(record: DynamicsRecord): DynamicType {
  const kindValue = (record.kind || "").toString();
  if (kindValue === "lar") return "dinamica_lar";
  if (kindValue === "abrigo") return "dinamica";

  const value = (record.dynamic_type || "").toString();
  if (value === "dinamica_lar") return "dinamica_lar";
  return "dinamica";
}

function computeRates(
  rows: DynamicsTableRow[],
  populationInitial: number | null,
): RateCardData[] {
  if (!populationInitial || populationInitial <= 0) {
    return [
      { key: "entry", label: "Taxa de Entrada", value: null, trend: "neutral" },
      { key: "exit", label: "Taxa de Saída", value: null, trend: "neutral" },
      { key: "adoption", label: "Taxa de Adoção", value: null, trend: "neutral" },
      { key: "mortality", label: "Taxa de Mortalidade", value: null, trend: "neutral" },
      { key: "morbidity", label: "Taxa de Morbidade", value: null, trend: "neutral" },
    ];
  }

  const sum = rows.reduce(
    (acc, row) => {
      acc.entries += (row.metrics.entriesDogs ?? 0) + (row.metrics.entriesCats ?? 0);
      acc.exits +=
        (row.metrics.adoptionsDogs ?? 0) +
        (row.metrics.adoptionsCats ?? 0) +
        (row.metrics.returnsDogs ?? 0) +
        (row.metrics.returnsCats ?? 0) +
        (row.metrics.tutorReturnDogs ?? 0) +
        (row.metrics.tutorReturnCats ?? 0) +
        (row.metrics.originReturnDogs ?? 0) +
        (row.metrics.originReturnCats ?? 0) +
        (row.metrics.euthanasiasDogs ?? 0) +
        (row.metrics.euthanasiasCats ?? 0) +
        (row.metrics.naturalDeathsDogs ?? 0) +
        (row.metrics.naturalDeathsCats ?? 0);
      acc.adoptions += (row.metrics.adoptionsDogs ?? 0) + (row.metrics.adoptionsCats ?? 0);
      acc.mortality +=
        (row.metrics.euthanasiasDogs ?? 0) +
        (row.metrics.euthanasiasCats ?? 0) +
        (row.metrics.naturalDeathsDogs ?? 0) +
        (row.metrics.naturalDeathsCats ?? 0);
      acc.morbidity += (row.metrics.diseasesDogs ?? 0) + (row.metrics.diseasesCats ?? 0);
      return acc;
    },
    { entries: 0, exits: 0, adoptions: 0, mortality: 0, morbidity: 0 },
  );

  const toPercent = (value: number): number =>
    Number(((value / populationInitial) * 100).toFixed(2));

  return [
    { key: "entry", label: "Taxa de Entrada", value: toPercent(sum.entries), trend: "up" },
    { key: "exit", label: "Taxa de Saída", value: toPercent(sum.exits), trend: "down" },
    { key: "adoption", label: "Taxa de Adoção", value: toPercent(sum.adoptions), trend: "up" },
    {
      key: "mortality",
      label: "Taxa de Mortalidade",
      value: toPercent(sum.mortality),
      trend: "down",
    },
    {
      key: "morbidity",
      label: "Taxa de Morbidade",
      value: toPercent(sum.morbidity),
      trend: "neutral",
    },
  ];
}

function mapRecordToRow(record: DynamicsRecord): DynamicsTableRow {
  const metrics: DynamicsTableRow["metrics"] = {
    entriesDogs: record.entradas_de_animais ?? 0,
    entriesCats: record.entradas_de_gatos ?? 0,
    returnsDogs: record.devolucoes_caes ?? 0,
    returnsCats: record.devolucoes_gatos ?? 0,
    adoptionsDogs: record.adocoes_caes ?? 0,
    adoptionsCats: record.adocoes_gatos ?? 0,
    euthanasiasDogs: record.eutanasias_caes ?? 0,
    euthanasiasCats: record.eutanasias_gatos ?? 0,
    naturalDeathsDogs: record.mortes_naturais_caes ?? 0,
    naturalDeathsCats: record.mortes_naturais_gatos ?? 0,
    diseasesDogs: record.doencas_caes ?? 0,
    diseasesCats: record.doencas_gatos ?? 0,
    tutorReturnDogs: record.retorno_de_caes ?? 0,
    tutorReturnCats: record.retorno_de_gatos ?? 0,
    originReturnDogs: record.retorno_local_caes ?? 0,
    originReturnCats: record.retorno_local_gatos ?? 0,
  };
  return {
    id: record.id,
    referenceLabel: parseReferenceLabel(record.reference_period),
    referenceDate: record.reference_date ?? null,
    metrics,
    balance: computeBalance(metrics),
  };
}

function buildDisplay(
  records: DynamicsRecord[],
  dynamicType: DynamicType,
  populationInitial: number | null,
  populationFallback: number | null,
  populationDogs?: number | null,
  populationCats?: number | null,
): DynamicsDisplay {
  const filtered = records.filter(
    (item) => deriveDynamicType(item) === dynamicType,
  );
  const rows = filtered.map(mapRecordToRow);
  const populationInitialValue = populationInitial ?? populationFallback ?? null;
  const computeSpeciesCurrent = (
    initialDogs: number | null | undefined,
    initialCats: number | null | undefined,
  ) => {
    if (initialDogs === null && initialCats === null) return { dogs: null, cats: null };

    const totals = rows.reduce(
      (acc, row) => {
        acc.dogs +=
          (row.metrics.entriesDogs ?? 0) -
          ((row.metrics.adoptionsDogs ?? 0) +
            (row.metrics.returnsDogs ?? 0) +
            (row.metrics.tutorReturnDogs ?? 0) +
            (row.metrics.originReturnDogs ?? 0) +
            (row.metrics.euthanasiasDogs ?? 0) +
            (row.metrics.naturalDeathsDogs ?? 0));
        acc.cats +=
          (row.metrics.entriesCats ?? 0) -
          ((row.metrics.adoptionsCats ?? 0) +
            (row.metrics.returnsCats ?? 0) +
            (row.metrics.tutorReturnCats ?? 0) +
            (row.metrics.originReturnCats ?? 0) +
            (row.metrics.euthanasiasCats ?? 0) +
            (row.metrics.naturalDeathsCats ?? 0));
        return acc;
      },
      { dogs: 0, cats: 0 },
    );

    return {
      dogs: initialDogs !== null && initialDogs !== undefined ? initialDogs + totals.dogs : null,
      cats: initialCats !== null && initialCats !== undefined ? initialCats + totals.cats : null,
    };
  };

  const speciesCurrent = computeSpeciesCurrent(populationDogs, populationCats);
  const populationCurrent =
    populationInitialValue !== null
      ? populationInitialValue + rows.reduce((acc, row) => acc + (row.balance ?? 0), 0)
      : null;

  return {
    dynamicType,
    title: dynamicType === "dinamica_lar" ? "Dinâmica Populacional L.T" : "Dinâmica Populacional",
    populationInitial: populationInitialValue,
    populationCurrent,
    populationInitialDogs: populationDogs ?? null,
    populationInitialCats: populationCats ?? null,
    populationCurrentDogs: speciesCurrent.dogs,
    populationCurrentCats: speciesCurrent.cats,
    stats: computeRates(rows, populationInitialValue),
    rows: rows.sort((a, b) => a.referenceLabel.localeCompare(b.referenceLabel)),
  };
}

export async function fetchDynamicsDisplays(params: {
  supabaseAdmin: AdminClient;
  shelterId: string;
  populationInitial: number | null;
  populationInitialDogs?: number | null;
  populationInitialCats?: number | null;
}): Promise<DynamicsDisplay[]> {
  const {
    supabaseAdmin,
    shelterId,
    populationInitial,
    populationInitialDogs,
    populationInitialCats,
  } = params;
  const { data, error } = await supabaseAdmin
    .from("shelter_dynamics")
    .select(
      "id, shelter_id, dynamic_type, reference_period, reference_date, kind, entradas_de_animais, entradas_de_gatos, adocoes_caes, adocoes_gatos, devolucoes_caes, devolucoes_gatos, eutanasias_caes, eutanasias_gatos, mortes_naturais_caes, mortes_naturais_gatos, doencas_caes, doencas_gatos, retorno_de_caes, retorno_de_gatos, retorno_local_caes, retorno_local_gatos",
    )
    .eq("shelter_id", shelterId)
    .returns<DynamicsRecord[]>();

  if (error) {
    console.error("dynamicsService: erro ao buscar registros", error);
    return [
      buildDisplay(
        [],
        "dinamica",
        populationInitial,
        populationInitial,
        populationInitialDogs,
        populationInitialCats,
      ),
      buildDisplay(
        [],
        "dinamica_lar",
        populationInitial,
        populationInitial,
        populationInitialDogs,
        populationInitialCats,
      ),
    ];
  }

  const records = data ?? [];
  return [
    buildDisplay(
      records,
      "dinamica",
      populationInitial,
      populationInitial,
      populationInitialDogs,
      populationInitialCats,
    ),
    buildDisplay(
      records,
      "dinamica_lar",
      populationInitial,
      populationInitial,
      populationInitialDogs,
      populationInitialCats,
    ),
  ];
}

export async function saveDynamicsRecord(params: {
  supabaseAdmin: AdminClient;
  shelterId: string;
  payload: RegisterFormSubmit;
}): Promise<void> {
  const { supabaseAdmin, shelterId, payload } = params;
  const referencePeriod = `${payload.year}-${payload.month}`;
  const referenceDate = `${payload.year}-${payload.month}-01`;
  const kind = payload.dynamicType === "dinamica_lar" ? "lar" : "abrigo";

  const metrics: DynamicsTableRow["metrics"] = {
    entriesDogs: payload.entries,
    entriesCats: payload.entriesCats,
    returnsDogs: payload.returns,
    returnsCats: payload.returnsCats,
    adoptionsDogs: payload.adoptions,
    adoptionsCats: payload.adoptionsCats,
    euthanasiasDogs: payload.euthanasias,
    euthanasiasCats: payload.euthanasiasCats,
    naturalDeathsDogs: payload.naturalDeaths,
    naturalDeathsCats: payload.naturalDeathsCats,
    diseasesDogs: payload.diseases,
    diseasesCats: payload.diseasesCats,
    tutorReturnDogs: payload.tutorReturn,
    tutorReturnCats: payload.tutorReturnCats,
    originReturnDogs: payload.originReturn,
    originReturnCats: payload.originReturnCats,
  };

  const attempt = await supabaseAdmin
    .from("shelter_dynamics")
    .upsert(
      {
        shelter_id: shelterId,
        kind,
        dynamic_type: payload.dynamicType,
        reference_period: referencePeriod,
        reference_date: referenceDate,
        entradas_de_animais: metrics.entriesDogs,
        entradas_de_gatos: metrics.entriesCats,
        adocoes_caes: metrics.adoptionsDogs,
        adocoes_gatos: metrics.adoptionsCats,
        devolucoes_caes: metrics.returnsDogs,
        devolucoes_gatos: metrics.returnsCats,
        eutanasias_caes: metrics.euthanasiasDogs,
        eutanasias_gatos: metrics.euthanasiasCats,
        mortes_naturais_caes: metrics.naturalDeathsDogs,
        mortes_naturais_gatos: metrics.naturalDeathsCats,
        doencas_caes: metrics.diseasesDogs,
        doencas_gatos: metrics.diseasesCats,
        retorno_de_caes: metrics.tutorReturnDogs,
        retorno_de_gatos: metrics.tutorReturnCats,
        retorno_local_caes: metrics.originReturnDogs,
        retorno_local_gatos: metrics.originReturnCats,
      },
      { onConflict: "shelter_id,dynamic_type,reference_period" },
    );

  if (attempt.error) {
    console.error("dynamicsService: erro ao salvar registro", attempt.error);
    throw attempt.error;
  }
}

export async function deleteDynamicsRecord(params: {
  supabaseAdmin: AdminClient;
  shelterId: string;
  rowId: string;
}): Promise<void> {
  const { supabaseAdmin, shelterId, rowId } = params;

  const { error } = await supabaseAdmin
    .from("shelter_dynamics")
    .delete()
    .eq("id", rowId)
    .eq("shelter_id", shelterId);

  if (error) {
    console.error("dynamicsService: erro ao excluir registro", error);
    throw error;
  }
}
