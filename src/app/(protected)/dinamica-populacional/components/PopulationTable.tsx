import React, { useState, type JSX } from "react";
import { ArrowDownRight, ArrowUpRight, HelpCircle, LayoutGrid, Pencil, Table, Activity } from "lucide-react";

import type { DynamicsTableRow } from "../types";
import PopulationGrid from "./PopulationGrid";
import {
  GROUPED_HEADERS,
  METRIC_COLUMNS,
  FLOW_STYLES,
  formatMetricValue,
  type FlowType,
} from "./populationMetrics";

const FLOW_ICONS: Record<FlowType, typeof ArrowUpRight> = {
  entrada: ArrowUpRight,
  saida: ArrowDownRight,
  indicador: Activity,
};

type PopulationTableProps = {
  populationInitial: number | null;
  populationCurrent: number | null;
  populationInitialDogs?: number | null;
  populationInitialCats?: number | null;
  populationCurrentDogs?: number | null;
  populationCurrentCats?: number | null;
  rows: DynamicsTableRow[];
  onEditRow?: (id: string) => void;
  onEditPopulation?: () => void;
  canEditPopulation?: boolean;
};

type ViewMode = "table" | "grid";

const VIEW_OPTIONS: Array<{
  key: ViewMode;
  label: string;
  icon: typeof Table;
}> = [
  { key: "table", label: "Tabela", icon: Table },
  { key: "grid", label: "Grid", icon: LayoutGrid },
];

export default function PopulationTable({
  populationInitial,
  populationCurrent,
  populationInitialDogs,
  populationInitialCats,
  populationCurrentDogs,
  populationCurrentCats,
  rows,
  onEditRow,
  onEditPopulation,
  canEditPopulation = true,
}: PopulationTableProps): JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div
          className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800"
          title="Quantidade de animais no abrigo no início do período de acompanhamento"
        >
          <span className="flex items-center gap-1">
            População Inicial:
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          </span>
          <span className="text-brand-primary">{populationInitial ?? "—"}</span>
          {(populationInitialDogs ?? populationInitialCats ?? null) !==
            null && (
            <span className="text-xs font-normal text-slate-600">
              {`(Cães: ${populationInitialDogs ?? 0} | Gatos: ${
                populationInitialCats ?? 0
              })`}
            </span>
          )}
          {canEditPopulation && onEditPopulation ? (
            <button
              type="button"
              onClick={onEditPopulation}
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-primary hover:text-brand-primary cursor-pointer"
              aria-label="Editar população inicial"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-600">
          <span>Visualização</span>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 shadow-inner">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = viewMode === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setViewMode(option.key)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "border border-brand-primary/60 bg-white text-brand-primary shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className={`transition-all duration-300 ${
            viewMode === "table"
              ? "opacity-100 translate-y-0"
              : "pointer-events-none absolute inset-0 translate-y-3 opacity-0"
          }`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 px-4 py-2 text-xs">
              <span className="font-semibold text-slate-600">Legenda:</span>
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-slate-600">Entrada (aumenta população)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100">
                  <ArrowDownRight className="h-3 w-3 text-rose-600" />
                </div>
                <span className="text-slate-600">Saída (reduz população)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
                  <Activity className="h-3 w-3 text-amber-600" />
                </div>
                <span className="text-slate-600">Indicador (não altera população)</span>
              </div>
            </div>
            <div className="max-h-150 overflow-auto">
              <table className="min-w-full border-collapse text-xs text-slate-800">
                <thead className="sticky top-0 z-10">
                  <tr className="text-[11px] uppercase tracking-wide">
                    <th className="sticky top-0 left-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-left font-semibold text-slate-600">
                      Data
                    </th>
                    {GROUPED_HEADERS.map((header) => {
                      const styles = FLOW_STYLES[header.flowType];
                      const Icon = FLOW_ICONS[header.flowType];
                      return (
                        <th
                          key={header.label}
                          className={`sticky top-0 border-b-2 border-r border-slate-200 px-2 py-2 text-center font-semibold ${styles.border} ${styles.bg} ${styles.text}`}
                          colSpan={2}
                          title={header.tooltip}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Icon className="h-3 w-3" aria-hidden />
                            <span>{header.label}</span>
                            <HelpCircle className="h-3 w-3 opacity-50" aria-hidden />
                          </div>
                        </th>
                      );
                    })}
                    <th
                      className="sticky top-0 z-20 border-b-2 border-r border-slate-200 bg-emerald-50 px-2 py-2 text-center font-semibold text-brand-primary"
                      title="Total de animais no abrigo ao final do período"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>População</span>
                        <HelpCircle className="h-3 w-3 opacity-50" aria-hidden />
                      </div>
                    </th>
                    {onEditRow && (
                      <th className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 px-4 py-2 text-center font-semibold text-slate-600">
                        Ações
                      </th>
                    )}
                  </tr>
                  <tr className="text-[10px] uppercase tracking-wide">
                    <th className="sticky top-10.5 left-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-2 py-1.5 text-left font-semibold text-slate-500">
                      &nbsp;
                    </th>
                    {GROUPED_HEADERS.map((header) => {
                      const styles = FLOW_STYLES[header.flowType];
                      return (
                        <React.Fragment key={`${header.label}-sub`}>
                          <th className={`sticky top-10.5 z-10 border-b border-r border-slate-200 px-2 py-1.5 text-center font-semibold ${styles.bg} ${styles.text}`}>
                            Cães
                          </th>
                          <th className={`sticky top-10.5 z-10 border-b border-r border-slate-200 px-2 py-1.5 text-center font-semibold ${styles.bg} ${styles.text}`}>
                            Gatos
                          </th>
                        </React.Fragment>
                      );
                    })}
                    <th className="sticky top-10.5 z-20 border-b border-r border-slate-200 bg-emerald-50 px-2 py-1.5 text-center font-semibold text-brand-primary">
                      &nbsp;
                    </th>
                    {onEditRow && (
                      <th className="sticky top-10.5 z-20 border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-center font-semibold text-slate-500">
                        &nbsp;
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    let columnIndex = 0;
                    return (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-2 py-2 text-sm font-semibold">
                          {row.referenceLabel}
                        </td>
                        {GROUPED_HEADERS.map((header) => {
                          const styles = FLOW_STYLES[header.flowType];
                          const dogsColumn = METRIC_COLUMNS[columnIndex];
                          const catsColumn = METRIC_COLUMNS[columnIndex + 1];
                          columnIndex += 2;
                          return (
                            <React.Fragment key={`${row.id}-${header.label}`}>
                              <td className={`border-r border-slate-200 px-2 py-2 text-center text-sm ${styles.bg}/30`}>
                                {formatMetricValue(row.metrics[dogsColumn.key])}
                              </td>
                              <td className={`border-r border-slate-200 px-2 py-2 text-center text-sm ${styles.bg}/30`}>
                                {formatMetricValue(row.metrics[catsColumn.key])}
                              </td>
                            </React.Fragment>
                          );
                        })}
                        <td className="border-r border-slate-200 bg-brand-primary/5 px-2 py-2 text-center text-sm font-semibold text-brand-primary">
                          {formatMetricValue(row.cumulativeBalance)}
                        </td>
                        {onEditRow && (
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => onEditRow(row.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-primary hover:text-brand-primary cursor-pointer"
                              aria-label="Editar registro"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="rounded-xl border border-dashed border-brand-primary/40 bg-brand-primary/5 px-4 py-3 text-sm font-semibold text-brand-primary"
              title="População Inicial + soma de todas as entradas - soma de todas as saídas"
            >
              <span className="flex items-center gap-1">
                População Atual:
                <HelpCircle className="h-3.5 w-3.5 opacity-50" aria-hidden />
              </span>
              <span className="text-slate-900">{populationCurrent ?? "—"}</span>{" "}
              {(populationCurrentDogs ?? populationCurrentCats ?? null) !==
                null && (
                <span className="text-xs font-semibold text-slate-600">
                  (Cães: {populationCurrentDogs ?? 0} | Gatos:{" "}
                  {populationCurrentCats ?? 0})
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ${
            viewMode === "grid"
              ? "opacity-100 translate-y-0"
              : "pointer-events-none absolute inset-0 translate-y-3 opacity-0"
          }`}
        >
          <PopulationGrid
            rows={rows}
            populationCurrent={populationCurrent}
            populationCurrentDogs={populationCurrentDogs}
            populationCurrentCats={populationCurrentCats}
            onEditRow={onEditRow}
          />
        </div>
      </div>
    </div>
  );
}
