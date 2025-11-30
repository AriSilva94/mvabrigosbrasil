"use client";

import type { ChangeEvent } from "react";

type FiltersPanelProps = {
  years: number[];
  states: Array<{ value: string; label: string; count?: number }>;
  selectedYear: number;
  selectedState: string;
  onYearChange: (year: number) => void;
  onStateChange: (state: string) => void;
  onApply?: () => void;
};

export default function FiltersPanel({
  years,
  states,
  selectedYear,
  selectedState,
  onYearChange,
  onStateChange,
  onApply,
}: FiltersPanelProps) {
  function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
    onYearChange(Number.parseInt(event.target.value, 10));
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    onStateChange(event.target.value);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex min-w-[180px] flex-col gap-2 text-sm font-semibold text-slate-700">
        <span className="font-600 text-slate-800">Ano</span>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm transition hover:border-brand-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[240px] flex-col gap-2 text-sm font-semibold text-slate-700">
        <span className="font-600 text-slate-800">Estado</span>
        <select
          value={selectedState}
          onChange={handleStateChange}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm transition hover:border-brand-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          {states.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
              {typeof state.count === "number" ? ` (${state.count})` : ""}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onApply}
        className="inline-flex h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary cursor-pointer"
      >
        Filtrar
      </button>
    </div>
  );
}
