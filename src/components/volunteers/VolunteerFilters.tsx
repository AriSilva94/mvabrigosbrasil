"use client";

import Select from "@/components/ui/Select";
import {
  VOLUNTEER_STATE_FILTERS,
  VOLUNTEER_AVAILABILITY_FILTERS,
} from "@/constants/volunteerFilters";

interface VolunteerFiltersProps {
  selectedState: string;
  selectedAvailability: string;
  onStateChange: (state: string) => void;
  onAvailabilityChange: (availability: string) => void;
}

export default function VolunteerFilters({
  selectedState,
  selectedAvailability,
  onStateChange,
  onAvailabilityChange,
}: VolunteerFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="state-filter"
          className="mb-2 block text-sm font-medium text-[#68707b]"
        >
          Estado
        </label>
        <Select
          id="state-filter"
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
        >
          {VOLUNTEER_STATE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="availability-filter"
          className="mb-2 block text-sm font-medium text-[#68707b]"
        >
          Disponibilidade de Tempo
        </label>
        <Select
          id="availability-filter"
          value={selectedAvailability}
          onChange={(e) => onAvailabilityChange(e.target.value)}
        >
          {VOLUNTEER_AVAILABILITY_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
