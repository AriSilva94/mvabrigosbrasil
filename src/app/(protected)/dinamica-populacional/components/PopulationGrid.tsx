import React, { type JSX } from "react";
import { Pencil } from "lucide-react";

import type { DynamicsTableRow } from "../types";
import { METRIC_GROUPS, formatMetricValue } from "./populationMetrics";

type PopulationGridProps = {
  rows: DynamicsTableRow[];
  populationCurrent: number | null;
  populationCurrentDogs?: number | null;
  populationCurrentCats?: number | null;
  onEditRow?: (id: string) => void;
};

const SPECIES_LABEL: Record<"dogs" | "cats", string> = {
  dogs: "Cães",
  cats: "Gatos",
};

export default function PopulationGrid({
  rows,
  populationCurrent,
  populationCurrentDogs,
  populationCurrentCats,
  onEditRow,
}: PopulationGridProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="max-h-150 overflow-auto">
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <article
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm ring-1 ring-transparent transition duration-300 hover:-translate-y-0.5 hover:border-brand-primary/60 hover:ring-brand-primary/20"
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {row.referenceLabel}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Saldo:{" "}
                    <span className="text-brand-primary">
                      {formatMetricValue(row.balance)}
                    </span>
                  </p>
                </div>
                {onEditRow ? (
                  <button
                    type="button"
                    onClick={() => onEditRow(row.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-primary hover:text-brand-primary cursor-pointer"
                    aria-label="Editar registro"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </header>

              <div className="grid gap-2 sm:grid-cols-2">
                {METRIC_GROUPS.map((group) => (
                  <div
                    key={`${row.id}-${group.label}`}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {group.label}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {group.metrics.map((metric) => (
                        <div
                          key={metric.key}
                          className="flex flex-col rounded-lg bg-white px-2.5 py-2 text-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {SPECIES_LABEL[metric.species]}
                          </span>
                          <span className="text-base font-semibold text-slate-900">
                            {formatMetricValue(row.metrics[metric.key])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-brand-primary/40 bg-brand-primary/5 px-4 py-3 text-sm font-semibold text-brand-primary">
        População Atual:{" "}
        <span className="text-slate-900">{populationCurrent ?? "—"}</span>{" "}
        {(populationCurrentDogs ?? populationCurrentCats ?? null) !== null && (
          <span className="text-xs font-semibold text-slate-600">
            (Cães: {populationCurrentDogs ?? 0} | Gatos:{" "}
            {populationCurrentCats ?? 0})
          </span>
        )}
      </div>
    </div>
  );
}
