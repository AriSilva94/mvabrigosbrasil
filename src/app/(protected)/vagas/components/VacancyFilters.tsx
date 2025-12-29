import type { Dispatch, JSX, SetStateAction } from "react";

import Select from "@/components/ui/Select";
import {
  VACANCY_PERIOD_FILTERS,
  VACANCY_STATE_FILTERS,
  VACANCY_WORKLOAD_FILTERS,
} from "@/constants/vacancyFilters";

type VacancyFiltersProps = {
  stateFilter: string;
  setStateFilter: Dispatch<SetStateAction<string>>;
  periodFilter: string;
  setPeriodFilter: Dispatch<SetStateAction<string>>;
  workloadFilter: string;
  setWorkloadFilter: Dispatch<SetStateAction<string>>;
};

export default function VacancyFilters({
  stateFilter,
  setStateFilter,
  periodFilter,
  setPeriodFilter,
  workloadFilter,
  setWorkloadFilter,
}: VacancyFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Select
        aria-label="Filtrar por estado"
        value={stateFilter}
        onChange={(event) => setStateFilter(event.target.value)}
      >
        {VACANCY_STATE_FILTERS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filtrar por período"
        value={periodFilter}
        onChange={(event) => setPeriodFilter(event.target.value)}
      >
        {VACANCY_PERIOD_FILTERS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filtrar por carga horária"
        value={workloadFilter}
        onChange={(event) => setWorkloadFilter(event.target.value)}
      >
        {VACANCY_WORKLOAD_FILTERS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
