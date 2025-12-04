"use client";

import FiltersPanel from "@/components/data/FiltersPanel";
import IndicatorsGrid from "@/components/data/IndicatorsGrid";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { DatabaseDataset } from "@/types/database.types";
import AnimalFlowChart from "./AnimalFlowChart";
import AdoptionsByTypeChart from "./AdoptionsByTypeChart";
import MonthlyEntriesChart from "./MonthlyEntriesChart";
import OutcomesStackedChart from "./OutcomesStackedChart";
import SpeciesEntriesChart from "./SpeciesEntriesChart";
import TypeEntriesChart from "./TypeEntriesChart";
import { useDashboardAggregations } from "./hooks/useDashboardAggregations";
import { useDashboardFilters } from "./hooks/useDashboardFilters";

type DatabaseDashboardProps = {
  dataset: DatabaseDataset;
};

export default function DatabaseDashboard({ dataset }: DatabaseDashboardProps) {
  const {
    year,
    state,
    pendingYear,
    pendingState,
    stateOptions,
    stateLabel,
    setPendingYear,
    setPendingState,
    applyFilters,
  } = useDashboardFilters({ dataset });
  const {
    overview,
    monthlyFlow,
    monthlyTypeEntriesDogs,
    monthlyTypeEntriesCats,
    speciesEntries,
    exitsBySpecies,
    outcomesDogs,
    outcomesCats,
    adoptionsByType,
  } = useDashboardAggregations({ dataset, year, state });

  return (
    <section className="bg-white pb-16 pt-12">
      <div className="container px-6 space-y-10 min-w-0">
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
              onApply={applyFilters}
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

        <div className="grid gap-4 lg:grid-cols-2 min-w-0 [&>*]:min-w-0">
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

        <div className="grid gap-4 lg:grid-cols-2 min-w-0 [&>*]:min-w-0">
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
