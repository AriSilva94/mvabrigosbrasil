"use client";

import { useMemo, useState } from "react";

import { ALL_STATES_VALUE, resolveStateLabel } from "@/lib/database/aggregations";
import { STATE_METADATA } from "@/lib/database/stateMetadata";
import type { DatabaseDataset } from "@/types/database.types";

type UseDashboardFiltersParams = {
  dataset: DatabaseDataset;
};

export function useDashboardFilters({ dataset }: UseDashboardFiltersParams) {
  const defaultYear = dataset.years[0] ?? new Date().getFullYear();
  const [year, setYear] = useState<number>(defaultYear);
  const [state, setState] = useState<string>(ALL_STATES_VALUE);
  const [pendingYear, setPendingYear] = useState<number>(defaultYear);
  const [pendingState, setPendingState] = useState<string>(ALL_STATES_VALUE);

  const stateOptions = useMemo(() => {
    const counts = dataset.shelters.reduce<Record<string, number>>(
      (acc, shelter) => {
        if (!shelter.state) return acc;
        acc[shelter.state] = (acc[shelter.state] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const options = STATE_METADATA.map((meta) => ({
      value: meta.code,
      label: meta.label,
      count: counts[meta.code] ?? 0,
    }));

    return [
      {
        value: ALL_STATES_VALUE,
        label: `Todos (${dataset.shelters.length})`,
      },
      ...options,
    ];
  }, [dataset.shelters]);

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
    stateOptions,
    stateLabel,
    setPendingYear,
    setPendingState,
    applyFilters,
  };
}
