"use client";

import { Combobox } from "@/components/ui/Combobox";
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
      <div className="flex-1 min-w-50">
        <Combobox
          options={[...VOLUNTEER_STATE_FILTERS]}
          value={selectedState}
          onChange={onStateChange}
          placeholder="Todos os Estados"
        />
      </div>

      <div className="flex-1 min-w-50">
        <Combobox
          options={[...VOLUNTEER_AVAILABILITY_FILTERS]}
          value={selectedAvailability}
          onChange={onAvailabilityChange}
          placeholder="Todas as Disponibilidades"
        />
      </div>
    </div>
  );
}
