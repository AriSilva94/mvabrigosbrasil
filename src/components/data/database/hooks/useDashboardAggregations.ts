"use client";

import { useMemo } from "react";

import {
  computeMonthlyAnimalFlow,
  computeMonthlyAdoptionsByType,
  computeMonthlyAnimalExits,
  computeMonthlyEntriesByType,
  computeMonthlyOutcomes,
  computeMonthlySpeciesEntries,
  computeOverview,
  type YearFilter,
} from "@/lib/database/aggregations";
import type { DatabaseDataset } from "@/types/database.types";

type UseDashboardAggregationsParams = {
  dataset: DatabaseDataset;
  year: YearFilter;
  state: string;
};

export function useDashboardAggregations({
  dataset,
  year,
  state,
}: UseDashboardAggregationsParams) {
  const overview = useMemo(
    () => computeOverview(dataset, year, state),
    [dataset, state, year]
  );
  const monthlyFlow = useMemo(
    () => computeMonthlyAnimalFlow(dataset, year, state),
    [dataset, state, year]
  );
  const monthlyTypeEntriesDogs = useMemo(
    () => computeMonthlyEntriesByType(dataset, year, state, "all"),
    [dataset, state, year]
  );
  const monthlyTypeEntriesCats = useMemo(
    () => computeMonthlyEntriesByType(dataset, year, state, "cat"),
    [dataset, state, year]
  );
  const speciesEntries = useMemo(
    () => computeMonthlySpeciesEntries(dataset, year, state),
    [dataset, state, year]
  );
  const exitsBySpecies = useMemo(
    () => computeMonthlyAnimalExits(dataset, year, state),
    [dataset, state, year]
  );
  const outcomesDogs = useMemo(
    () => computeMonthlyOutcomes(dataset, year, state, "dog"),
    [dataset, state, year]
  );
  const outcomesCats = useMemo(
    () => computeMonthlyOutcomes(dataset, year, state, "cat"),
    [dataset, state, year]
  );
  const adoptionsByType = useMemo(
    () => computeMonthlyAdoptionsByType(dataset, year, state),
    [dataset, state, year]
  );

  return {
    overview,
    monthlyFlow,
    monthlyTypeEntriesDogs,
    monthlyTypeEntriesCats,
    speciesEntries,
    exitsBySpecies,
    outcomesDogs,
    outcomesCats,
    adoptionsByType,
  };
}
