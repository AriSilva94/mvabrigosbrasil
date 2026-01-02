"use client";

import { useMemo, useState } from "react";

import { ALL_STATES_VALUE, resolveStateLabel } from "@/lib/database/aggregations";
import { STATE_METADATA } from "@/lib/database/stateMetadata";
import type { DatabaseDataset } from "@/types/database.types";

type UseDashboardFiltersParams = {
  dataset: DatabaseDataset;
};

export function useDashboardFilters({ dataset }: UseDashboardFiltersParams) {
  // Se não houver anos no dataset, usar os últimos 4 anos como fallback
  const currentYear = new Date().getFullYear();
  const availableYears = dataset.years.length > 0
    ? dataset.years
    : [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  const defaultYear = availableYears[0] ?? currentYear;
  const [year, setYear] = useState<number>(defaultYear);
  const [state, setState] = useState<string>(ALL_STATES_VALUE);
  const [pendingYear, setPendingYear] = useState<number>(defaultYear);
  const [pendingState, setPendingState] = useState<string>(ALL_STATES_VALUE);

  const stateOptions = useMemo(() => {
    // Contar quantos abrigos têm dinâmicas para o ano pendente
    // Isso garante que a contagem reflita dados reais disponíveis
    const shelterIdsWithDynamics = new Set(
      dataset.movements
        .filter((movement) => movement.year === pendingYear)
        .map((movement) => movement.shelterId)
        .filter(Boolean)
    );

    // Contar também todos os abrigos que têm dinâmicas em qualquer ano
    const allShelterIdsWithDynamics = new Set(
      dataset.movements
        .map((movement) => movement.shelterId)
        .filter(Boolean)
    );

    const counts = dataset.shelters.reduce<Record<string, number>>(
      (acc, shelter) => {
        if (!shelter.state) return acc;
        // Só conta se o abrigo tem dinâmicas para o ano selecionado
        if (shelterIdsWithDynamics.has(shelter.id)) {
          acc[shelter.state] = (acc[shelter.state] ?? 0) + 1;
        }
        return acc;
      },
      {}
    );

    const options = STATE_METADATA.map((meta) => ({
      value: meta.code,
      label: meta.label,
      count: counts[meta.code] ?? 0,
    }));

    // Para "Todos", contar todos os abrigos que têm dinâmicas em qualquer ano
    const totalWithData = allShelterIdsWithDynamics.size;

    return [
      {
        value: ALL_STATES_VALUE,
        label: `Todos (${totalWithData})`,
      },
      ...options,
    ];
  }, [dataset.shelters, dataset.movements, pendingYear]);

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
    stateLabel,
    setPendingYear,
    setPendingState,
    applyFilters,
  };
}
