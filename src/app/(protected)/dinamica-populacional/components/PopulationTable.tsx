import React, { useState, type JSX } from "react";
import { LayoutGrid, Pencil, Table } from "lucide-react";

import type { DynamicsTableRow } from "../types";
import PopulationGrid from "./PopulationGrid";
import {
  GROUPED_HEADERS,
  METRIC_COLUMNS,
  formatMetricValue,
} from "./populationMetrics";

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
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
          População Inicial:{" "}
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
          <div className="max-h-150 overflow-auto">
            <table className="min-w-full border-collapse text-xs text-slate-800">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
                  <th className="sticky top-0 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold">
                    Data
                  </th>
                  {GROUPED_HEADERS.map((label) => (
                    <th
                      key={label}
                      className="sticky top-0 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold"
                      colSpan={2}
                    >
                      {label}
                    </th>
                  ))}
                  <th className="sticky top-0 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold">
                    Saldo
                  </th>
                  <th className="sticky top-0 border-b border-slate-200 bg-slate-50 px-6 py-2 text-center font-semibold">
                    Ações
                  </th>
                </tr>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="sticky top-10.5 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold">
                    &nbsp;
                  </th>
                  {GROUPED_HEADERS.map((label) => (
                    <React.Fragment key={`${label}-sub`}>
                      <th className="sticky top-10.5 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold">
                        Cães
                      </th>
                      <th className="sticky top-10.5 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold">
                        Gatos
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="sticky top-10.5 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold">
                    &nbsp;
                  </th>
                  <th className="sticky top-10.5 border-b border-slate-200 bg-slate-50 px-3 py-2 text-center font-semibold">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="border-r border-slate-200 px-3 py-3 text-sm font-semibold">
                      {row.referenceLabel}
                    </td>
                    {METRIC_COLUMNS.map((column) => (
                      <td
                        key={`${row.id}-${column.key}`}
                        className="border-r border-slate-200 px-3 py-3 text-center text-sm"
                      >
                        {formatMetricValue(row.metrics[column.key])}
                      </td>
                    ))}
                    <td className="border-r border-slate-200 px-3 py-3 text-center text-sm font-semibold">
                      {formatMetricValue(row.balance)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onEditRow?.(row.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-primary hover:text-brand-primary cursor-pointer"
                        aria-label="Editar registro"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    className="px-3 py-3 text-right align-top text-sm font-semibold text-slate-800"
                    colSpan={METRIC_COLUMNS.length + 1}
                  >
                    População Atual:
                  </td>
                  <td
                    className="px-3 py-3 align-top text-left text-sm font-semibold text-brand-primary"
                    colSpan={2}
                  >
                    <div className="flex flex-col items-start gap-1">
                      {populationCurrent ?? "—"}
                      {(populationCurrentDogs ??
                        populationCurrentCats ??
                        null) !== null && (
                        <span className="text-xs font-semibold text-slate-600">
                          Cães: {populationCurrentDogs ?? 0} | Gatos:{" "}
                          {populationCurrentCats ?? 0}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
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
