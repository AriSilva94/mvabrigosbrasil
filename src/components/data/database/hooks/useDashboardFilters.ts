"use client";

import { useMemo, useState } from "react";

import {
  ALL_STATES_VALUE,
  ALL_YEARS_VALUE,
  resolveStateLabel,
  type YearFilter,
} from "@/lib/database/aggregations";
import { STATE_METADATA } from "@/lib/database/stateMetadata";
import type { DatabaseDataset } from "@/types/database.types";

type UseDashboardFiltersParams = {
  dataset: DatabaseDataset;
};

export function useDashboardFilters({ dataset }: UseDashboardFiltersParams) {
  // Se não houver anos no dataset, usar os últimos 4 anos como fallback
  const currentYear = new Date().getFullYear();
  const baseYears = dataset.years.length > 0
    ? dataset.years
    : [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const availableYears: YearFilter[] = [ALL_YEARS_VALUE, ...baseYears];

  const defaultYear = baseYears[0] ?? currentYear;
  const [year, setYear] = useState<YearFilter>(defaultYear);
  const [state, setState] = useState<string>(ALL_STATES_VALUE);
  const [pendingYear, setPendingYear] = useState<YearFilter>(defaultYear);
  const [pendingState, setPendingState] = useState<string>(ALL_STATES_VALUE);

  const sheltersForPendingYear = useMemo(
    () =>
      pendingYear === ALL_YEARS_VALUE
        ? dataset.shelters
        : dataset.shelters.filter((shelter) => shelter.year === pendingYear),
    [dataset.shelters, pendingYear]
  );

  const stateOptions = useMemo(() => {
    const counts = sheltersForPendingYear.reduce<Record<string, number>>((acc, shelter) => {
      if (!shelter.state) return acc;
      acc[shelter.state] = (acc[shelter.state] ?? 0) + 1;
      return acc;
    }, {});

    const options = STATE_METADATA.map((meta) => ({
      value: meta.code,
      label: meta.label,
      count: counts[meta.code] ?? 0,
    }));

    return [
      {
        value: ALL_STATES_VALUE,
        label: `Todos (${sheltersForPendingYear.length})`,
      },
      ...options,
    ];
  }, [sheltersForPendingYear]);

  const yearLabel = useMemo(
    () => (year === ALL_YEARS_VALUE ? "Todos os anos" : year.toString()),
    [year]
  );

  const stateLabel = useMemo(
    () =>
      stateOptions.find((option) => option.value === state)?.label ??
      resolveStateLabel(state, dataset.states),
    [dataset.states, state, stateOptions]
  );

  function applyFilters() {
    setYear(pendingYear);
    setState(pendingState);
  }

  return {
    year,
    state,
    pendingYear,
    pendingState,
    availableYears,
    stateOptions,
    yearLabel,
    stateLabel,
    setPendingYear,
    setPendingState,
    applyFilters,
  };
}
