"use client";

import SelectField from "./SelectField";

type FiltersPanelProps = {
  years: Array<number | string>;
  states: Array<{ value: string; label: string; count?: number }>;
  selectedYear: number | string;
  selectedState: string;
  onYearChange: (year: number | string) => void;
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
  return (
    <div className="pt-6 flex w-full flex-col gap-4 sm:flex-wrap sm:flex-row sm:items-end sm:[&_label]:w-auto [&_label]:w-full">
      <SelectField
        id="year"
        label="Ano"
        value={selectedYear}
        options={years.map((year) => ({
          value: year,
          label: typeof year === "string" ? "Todos os anos" : year.toString(),
        }))}
        onChange={onYearChange}
        className="sm:min-w-[50]"
      />

      <SelectField
        id="state"
        label="Estado"
        value={selectedState}
        options={states}
        onChange={onStateChange}
        className="sm:min-w-60"
      />

      <button
        type="button"
        onClick={onApply}
        className="inline-flex h-11.5 w-full items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-secondary cursor-pointer sm:w-auto"
      >
        Filtrar
      </button>
    </div>
  );
}
