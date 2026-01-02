import type {
  DatabaseDataset,
  MonthlyAnimalFlow,
  OverviewMetrics,
} from "@/types/database.types";

export const ALL_STATES_VALUE = "all";
export const ALL_YEARS_VALUE = "all-years";
export type YearFilter = number | typeof ALL_YEARS_VALUE;

const MONTH_LABELS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

function matchesYear(recordYear: number | undefined, selectedYear: YearFilter): boolean {
  if (selectedYear === ALL_YEARS_VALUE) return true;
  return recordYear === selectedYear;
}

function matchesState(recordState: string | undefined, selectedState: string): boolean {
  if (selectedState === ALL_STATES_VALUE) return true;
  return (recordState ?? "").toUpperCase() === selectedState.toUpperCase();
}

export function computeOverview(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string
): OverviewMetrics {
  const shelters = dataset.shelters.filter(
    (shelter) => matchesYear(shelter.year, year) && matchesState(shelter.state, state)
  );

  return shelters.reduce<OverviewMetrics>(
    (acc, shelter) => {
      acc.totalShelters += 1;

      if (shelter.type === "Público") acc.publicCount += 1;
      if (shelter.type === "Privado") acc.privateCount += 1;
      if (shelter.type === "Misto") acc.mixedCount += 1;
      if (shelter.type === "LT-PI") acc.ltpiCount += 1;

      return acc;
    },
    { totalShelters: 0, publicCount: 0, privateCount: 0, mixedCount: 0, ltpiCount: 0 }
  );
}

export function computeMonthlyAnimalFlow(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string
): MonthlyAnimalFlow[] {
  const movements = dataset.movements.filter(
    (movement) => matchesYear(movement.year, year) && matchesState(movement.shelterState, state)
  );

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;

    const totals = movements
      .filter((movement) => movement.month === month)
      .reduce(
        (acc, movement) => {
          acc.entradas += movement.metrics.entradas + movement.metrics.entradasGatos;
          acc.devolucoes += movement.metrics.devolucoes + movement.metrics.devolucoesGatos;
          acc.adocoes += movement.metrics.adocoes + movement.metrics.adocoesGatos;
          acc.eutanasias += movement.metrics.eutanasias + movement.metrics.eutanasiasGatos;
          acc.mortesNaturais +=
            movement.metrics.mortesNaturais + movement.metrics.mortesNaturaisGatos;
          acc.retornoTutor += movement.metrics.retornoTutor;
          acc.retornoLocal += movement.metrics.retornoLocal;
          return acc;
        },
        {
          entradas: 0,
          adocoes: 0,
          devolucoes: 0,
          eutanasias: 0,
          mortesNaturais: 0,
          retornoTutor: 0,
          retornoLocal: 0,
        }
      );

    return { month, label, ...totals };
  });
}

export function resolveStateLabel(state: string, states: string[]): string {
  if (state === ALL_STATES_VALUE) return "Todos os estados";
  const found = states.find((item) => item.toUpperCase() === state.toUpperCase());
  return found ?? state;
}

type TypeBreakdown = {
  month: number;
  label: string;
  publico: number;
  privado: number;
  misto: number;
  ltpi: number;
};

export function computeMonthlyEntriesByType(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string,
  species: "all" | "cat" = "all"
): TypeBreakdown[] {
  const movements = dataset.movements.filter(
    (movement) => matchesYear(movement.year, year) && matchesState(movement.shelterState, state)
  );

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const totals: TypeBreakdown = { month, label, publico: 0, privado: 0, misto: 0, ltpi: 0 };

    movements
      .filter((movement) => movement.month === month)
      .forEach((movement) => {
        const catEntries = movement.metrics.entradasGatos + movement.metrics.devolucoesGatos;
        const dogEntries = movement.metrics.entradas + movement.metrics.devolucoes;
        const entryValue = species === "cat" ? catEntries : dogEntries;
        const type = movement.shelterType;
        if (type === "Público") totals.publico += entryValue;
        if (type === "Privado") totals.privado += entryValue;
        if (type === "Misto") totals.misto += entryValue;
        if (type === "LT-PI") totals.ltpi += entryValue;
      });

    return totals;
  });
}

type SpeciesEntries = {
  month: number;
  label: string;
  dogs: number;
  cats: number;
  total: number;
};

export function computeMonthlySpeciesEntries(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string
): SpeciesEntries[] {
  const movements = dataset.movements.filter(
    (movement) => matchesYear(movement.year, year) && matchesState(movement.shelterState, state)
  );

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const monthMovements = movements.filter((movement) => movement.month === month);

    // Entradas devem considerar apenas entradas (não devoluções)
    const cats = monthMovements.reduce(
      (acc, movement) => acc + movement.metrics.entradasGatos,
      0
    );
    const dogs = monthMovements.reduce(
      (acc, movement) => acc + movement.metrics.entradas,
      0
    );
    const totalsCombined = cats + dogs;

    return { month, label, dogs, cats, total: totalsCombined };
  });
}

export function computeMonthlyAnimalExits(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string
): SpeciesEntries[] {
  const movements = dataset.movements.filter(
    (movement) => matchesYear(movement.year, year) && matchesState(movement.shelterState, state)
  );

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const monthMovements = movements.filter((movement) => movement.month === month);

    const cats = monthMovements.reduce(
      (acc, movement) =>
        acc +
        movement.metrics.adocoesGatos +
        movement.metrics.mortesNaturaisGatos +
        movement.metrics.eutanasiasGatos,
      0
    );
    const dogs = monthMovements.reduce(
      (acc, movement) =>
        acc +
        movement.metrics.adocoes +
        movement.metrics.mortesNaturais +
        movement.metrics.eutanasias,
      0
    );

    return { month, label, dogs, cats, total: dogs + cats };
  });
}

type OutcomesBreakdown = {
  month: number;
  label: string;
  adocoes: number;
  mortesNaturais: number;
  eutanasias: number;
  retornoTutor: number;
  retornoLocal: number;
};

export function computeMonthlyOutcomes(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string,
  species: "all" | "cat" | "dog" = "all"
): OutcomesBreakdown[] {
  const movements = dataset.movements.filter(
    (movement) => matchesYear(movement.year, year) && matchesState(movement.shelterState, state)
  );

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const monthMovements = movements.filter((movement) => movement.month === month);

    const totals = monthMovements.reduce(
      (acc, movement) => {
        const metrics = movement.metrics;
        const select = (allValue: number, catValue: number) => {
          if (species === "all") return allValue + catValue;
          if (species === "cat") return catValue;
          return Math.max(allValue, 0);
        };
        const selectReturn = (combinedValue: number, catValue: number) => {
          if (species === "all") return combinedValue;
          if (species === "cat") return catValue;
          return Math.max(combinedValue - catValue, 0);
        };

        acc.adocoes += select(metrics.adocoes, metrics.adocoesGatos);
        acc.mortesNaturais += select(metrics.mortesNaturais, metrics.mortesNaturaisGatos);
        acc.eutanasias += select(metrics.eutanasias, metrics.eutanasiasGatos);
        acc.retornoTutor += selectReturn(metrics.retornoTutor, metrics.retornoTutorGatos);
        acc.retornoLocal += selectReturn(metrics.retornoLocal, metrics.retornoLocalGatos);

        return acc;
      },
      { adocoes: 0, mortesNaturais: 0, eutanasias: 0, retornoTutor: 0, retornoLocal: 0 }
    );

    return { month, label, ...totals };
  });
}

export function computeMonthlyAdoptionsByType(
  dataset: DatabaseDataset,
  year: YearFilter,
  state: string
): TypeBreakdown[] {
  const movements = dataset.movements.filter(
    (movement) => matchesYear(movement.year, year) && matchesState(movement.shelterState, state)
  );

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const totals: TypeBreakdown = { month, label, publico: 0, privado: 0, misto: 0, ltpi: 0 };

    movements
      .filter((movement) => movement.month === month)
      .forEach((movement) => {
        const exitsTotal =
          movement.metrics.adocoes +
          movement.metrics.mortesNaturais +
          movement.metrics.eutanasias +
          movement.metrics.adocoesGatos +
          movement.metrics.mortesNaturaisGatos +
          movement.metrics.eutanasiasGatos +
          movement.metrics.retornoTutor +
          movement.metrics.retornoLocal;

        const type = movement.shelterType;
        if (type === "Público") totals.publico += exitsTotal;
        if (type === "Privado") totals.privado += exitsTotal;
        if (type === "Misto") totals.misto += exitsTotal;
        if (type === "LT-PI") totals.ltpi += exitsTotal;
      });

    return totals;
  });
}
