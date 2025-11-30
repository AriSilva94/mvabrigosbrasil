"use client";

import { useMemo, useState } from "react";

import FiltersPanel from "@/components/data/FiltersPanel";
import IndicatorsGrid from "@/components/data/IndicatorsGrid";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  ALL_STATES_VALUE,
  computeMonthlyAnimalFlow,
  computeMonthlyAdoptionsByType,
  computeMonthlyEntriesByType,
  computeMonthlyOutcomes,
  computeMonthlySpeciesEntries,
  computeMonthlyAnimalExits,
  computeOverview,
  resolveStateLabel,
} from "@/lib/database/aggregations";
import { STATE_METADATA } from "@/lib/database/stateMetadata";
import type { DatabaseDataset } from "@/types/database.types";
import AnimalFlowChart from "./AnimalFlowChart";
import AdoptionsByTypeChart from "./AdoptionsByTypeChart";
import MonthlyEntriesChart from "./MonthlyEntriesChart";
import OutcomesStackedChart from "./OutcomesStackedChart";
import SpeciesEntriesChart from "./SpeciesEntriesChart";
import TypeEntriesChart from "./TypeEntriesChart";

type DatabaseDashboardProps = {
  dataset: DatabaseDataset;
};

export default function DatabaseDashboard({ dataset }: DatabaseDashboardProps) {
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

  return (
    <section className="bg-white pb-16 pt-12">
      <div className="container px-6 space-y-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-700">
              Abaixo são mostrados os dados e infográficos coletados pelos
              abrigos e lares temporários do Brasil.
            </p>
            <p className="text-sm text-slate-700">
              Use os filtros para descobrir insights de dados nos níveis
              nacional, estadual e municipal, por organizações individuais,
              espécie e indicador da dinâmica populacional analisado.
            </p>
            <p className="text-sm text-slate-700">
              Os painéis são atualizados mensalmente.
            </p>

            <FiltersPanel
              years={dataset.years}
              states={stateOptions}
              selectedYear={pendingYear}
              selectedState={pendingState}
              onYearChange={setPendingYear}
              onStateChange={setPendingState}
              onApply={() => {
                setYear(pendingYear);
                setState(pendingState);
              }}
            />
          </div>

          <IndicatorsGrid
            metrics={overview}
            year={year}
            stateLabel={stateLabel}
          />
        </div>

        <AnimalFlowChart
          data={monthlyFlow}
          year={year}
          stateLabel={stateLabel}
        />

        <div className="flex items-center gap-2 text-slate-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
            <ArrowUp size={16} strokeWidth={2.5} />
          </span>
          <span className="font-18 font-semibold">Entradas de Animais</span>
        </div>

        <MonthlyEntriesChart data={speciesEntries} />

        <div className="grid gap-4 lg:grid-cols-2">
          <TypeEntriesChart
            title="Entrada por Tipo de Abrigo - Cão"
            data={monthlyTypeEntriesDogs}
          />
          <TypeEntriesChart
            title="Entrada por Tipo de Abrigo - Gato"
            data={monthlyTypeEntriesCats}
          />
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red text-white">
            <ArrowDown size={16} strokeWidth={2.5} />
          </span>
          <span className="font-18 font-semibold">Saída de Animais</span>
        </div>

        <SpeciesEntriesChart data={exitsBySpecies} />

        <div className="grid gap-4 lg:grid-cols-2">
          <OutcomesStackedChart
            title="Saída por Classificação (cão)"
            data={outcomesDogs}
          />
          <OutcomesStackedChart
            title="Saída por Classificação (gato)"
            data={outcomesCats}
          />
        </div>

        <AdoptionsByTypeChart data={adoptionsByType} />
      </div>
    </section>
  );
}
