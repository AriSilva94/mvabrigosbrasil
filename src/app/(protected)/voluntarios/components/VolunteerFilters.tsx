import type { Dispatch, JSX, SetStateAction } from "react";

import Select from "@/components/ui/Select";
import {
  VOLUNTEER_AVAILABILITY_FILTERS,
  VOLUNTEER_GENDER_FILTERS,
  VOLUNTEER_STATE_FILTERS,
} from "@/constants/volunteerFilters";

type VolunteerFiltersProps = {
  stateFilter: string;
  setStateFilter: Dispatch<SetStateAction<string>>;
  genderFilter: string;
  setGenderFilter: Dispatch<SetStateAction<string>>;
  availabilityFilter: string;
  setAvailabilityFilter: Dispatch<SetStateAction<string>>;
};

export default function VolunteerFilters({
  stateFilter,
  setStateFilter,
  genderFilter,
  setGenderFilter,
  availabilityFilter,
  setAvailabilityFilter,
}: VolunteerFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Select
        aria-label="Filtrar por estado"
        value={stateFilter}
        onChange={(event) => setStateFilter(event.target.value)}
      >
        {VOLUNTEER_STATE_FILTERS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filtrar por gênero"
        value={genderFilter}
        onChange={(event) => setGenderFilter(event.target.value)}
      >
        {VOLUNTEER_GENDER_FILTERS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filtrar por disponibilidade"
        value={availabilityFilter}
        onChange={(event) => setAvailabilityFilter(event.target.value)}
      >
        {VOLUNTEER_AVAILABILITY_FILTERS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
