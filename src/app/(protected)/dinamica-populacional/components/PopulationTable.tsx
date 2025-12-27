import React, { type JSX } from "react";
import { Pencil } from "lucide-react";

import type { DynamicsTableRow } from "../types";

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
};

const METRIC_COLUMNS: Array<{
  key: keyof DynamicsTableRow["metrics"];
  label: string;
  species: "dogs" | "cats";
}> = [
  { key: "entriesDogs", label: "Entradas", species: "dogs" },
  { key: "entriesCats", label: "Entradas", species: "cats" },
  { key: "returnsDogs", label: "Devoluções", species: "dogs" },
  { key: "returnsCats", label: "Devoluções", species: "cats" },
  { key: "adoptionsDogs", label: "Adoções", species: "dogs" },
  { key: "adoptionsCats", label: "Adoções", species: "cats" },
  { key: "euthanasiasDogs", label: "Eutanásias", species: "dogs" },
  { key: "euthanasiasCats", label: "Eutanásias", species: "cats" },
  { key: "naturalDeathsDogs", label: "Mortes Naturais", species: "dogs" },
  { key: "naturalDeathsCats", label: "Mortes Naturais", species: "cats" },
  { key: "diseasesDogs", label: "Doenças", species: "dogs" },
  { key: "diseasesCats", label: "Doenças", species: "cats" },
  { key: "tutorReturnDogs", label: "Retorno Tutor", species: "dogs" },
  { key: "tutorReturnCats", label: "Retorno Tutor", species: "cats" },
  { key: "originReturnDogs", label: "Retorno Origem", species: "dogs" },
  { key: "originReturnCats", label: "Retorno Origem", species: "cats" },
];

const groupedHeaders = [
  "Entradas",
  "Devoluções",
  "Adoções",
  "Eutanásias",
  "Mortes Naturais",
  "Doenças",
  "Retorno Tutor",
  "Retorno Origem",
];

const formatValue = (value: number | null): string =>
  typeof value === "number" ? String(value) : "—";

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
}: PopulationTableProps): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
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
          <button
            type="button"
            onClick={onEditPopulation}
            className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-primary hover:text-brand-primary cursor-pointer"
            aria-label="Editar população inicial"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs text-slate-800">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
              <th className="border-b border-r border-slate-200 px-3 py-2 text-left font-semibold">
                Data
              </th>
              {groupedHeaders.map((label) => (
                <th
                  key={label}
                  className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold"
                  colSpan={2}
                >
                  {label}
                </th>
              ))}
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold">
                Saldo
              </th>
              <th className="border-b border-slate-200 px-6 py-2 text-center font-semibold">
                Ações
              </th>
            </tr>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="border-b border-r border-slate-200 px-3 py-2 text-left font-semibold">
                &nbsp;
              </th>
              {groupedHeaders.map((label) => (
                <React.Fragment key={`${label}-sub`}>
                  <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold">
                    Cães
                  </th>
                  <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold">
                    Gatos
                  </th>
                </React.Fragment>
              ))}
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold">
                &nbsp;
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold">
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
                    {formatValue(row.metrics[column.key])}
                  </td>
                ))}
                <td className="border-r border-slate-200 px-3 py-3 text-center text-sm font-semibold">
                  {formatValue(row.balance)}
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
                  {(populationCurrentDogs ?? populationCurrentCats ?? null) !==
                    null && (
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
  );
}
