"use client";

import type { ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";

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
    <div className="pt-6 flex w-full flex-col gap-4 sm:flex-wrap sm:flex-row sm:items-end sm:[&_label]:w-auto [&_label]:w-full">
      <label className="flex w-full sm:min-w-[200px] flex-col gap-2 text-sm font-semibold text-slate-700">
        <span className="font-600 text-slate-800">Ano</span>
        <div className="relative">
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-5 pr-12 text-base leading-tight text-slate-800 shadow-sm transition hover:border-brand-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
        </div>
      </label>

      <label className="flex w-full sm:min-w-60 flex-col gap-2 text-sm font-semibold text-slate-700">
        <span className="font-600 text-slate-800">Estado</span>
        <div className="relative">
          <select
            id="state"
            value={selectedState}
            onChange={handleStateChange}
            className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-5 pr-12 text-base leading-tight text-slate-800 shadow-sm transition hover:border-brand-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            {states.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
                {typeof state.count === "number" ? ` (${state.count})` : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
        </div>
      </label>

      <button
        type="button"
        onClick={onApply}
        className="inline-flex h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary cursor-pointer sm:w-auto"
      >
        Filtrar
      </button>
    </div>
  );
}
