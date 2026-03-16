import type { Dispatch, JSX, SetStateAction } from "react";

import { Combobox } from "@/components/ui/Combobox";
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
      <Combobox
        options={VACANCY_STATE_FILTERS}
        value={stateFilter}
        onChange={setStateFilter}
        placeholder="Todos os Estados"
      />

      <Combobox
        options={VACANCY_PERIOD_FILTERS}
        value={periodFilter}
        onChange={setPeriodFilter}
        placeholder="Todos os Períodos"
      />

      <Combobox
        options={VACANCY_WORKLOAD_FILTERS}
        value={workloadFilter}
        onChange={setWorkloadFilter}
        placeholder="Todas as Cargas Horárias"
      />
    </div>
  );
}
