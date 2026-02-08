import type { JSX } from "react";

import { Heading, Text } from "@/components/ui/typography";
import EmptyState from "./EmptyState";
import PopulationTable from "./PopulationTable";
import StatsGrid from "./StatsGrid";
import type { DynamicType, DynamicsDisplay } from "../types";

type DynamicsSectionProps = {
  id?: string;
  statsId?: string;
  tableId?: string;
  data: DynamicsDisplay;
  onCreate: (type: DynamicType) => void;
  onEditRow?: (id: string, type: DynamicType) => void;
  isLoading?: boolean;
  onEditPopulation?: () => void;
  canEditPopulation?: boolean;
  isReadOnly?: boolean;
};

export default function DynamicsSection({
  id,
  statsId,
  tableId,
  data,
  onCreate,
  onEditRow,
  isLoading = false,
  onEditPopulation,
  canEditPopulation = true,
  isReadOnly = false,
}: DynamicsSectionProps): JSX.Element {
  const hasData = data.rows.length > 0;

  return (
    <section id={id} className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <Heading as="h3" className="text-lg font-semibold text-slate-900">
          {data.title}
        </Heading>
        <Text className="text-sm text-slate-600">
          Visão geral das taxas, população e registros mensais para{" "}
          {data.dynamicType === "dinamica_lar"
            ? "Lares Temporários"
            : "Dinâmica do Abrigo"}
          .
        </Text>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : hasData ? (
        <div className="space-y-5">
          <StatsGrid id={statsId} stats={data.stats} />
          <PopulationTable
            id={tableId}
            populationInitial={data.populationInitial}
            populationCurrent={data.populationCurrent}
            populationInitialDogs={data.populationInitialDogs}
            populationInitialCats={data.populationInitialCats}
            populationCurrentDogs={data.populationCurrentDogs}
            populationCurrentCats={data.populationCurrentCats}
            rows={data.rows}
            onEditRow={onEditRow ? (id) => onEditRow(id, data.dynamicType) : undefined}
            onEditPopulation={onEditPopulation}
            canEditPopulation={canEditPopulation}
          />
        </div>
      ) : (
        <EmptyState
          onOpenRegister={() => onCreate(data.dynamicType)}
          isReadOnly={isReadOnly}
        />
      )}
    </section>
  );
}
