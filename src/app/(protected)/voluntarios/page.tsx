"use client";

import type { JSX } from "react";
import { useMemo, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Text } from "@/components/ui/typography";
import VolunteerCard from "./components/VolunteerCard";
import VolunteerFilters from "./components/VolunteerFilters";
import { useVolunteerCards } from "@/components/volunteers/hooks/useVolunteerCards";

function VolunteerList(): JSX.Element {
  const volunteers = useVolunteerCards();
  const [stateFilter, setStateFilter] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const matchesState =
        !stateFilter ||
        volunteer.state?.toLowerCase() === stateFilter.toLowerCase();

      // Placeholder filters until we fetch gender/availability data
      const matchesGender = !genderFilter;
      const matchesAvailability = !availabilityFilter;

      return matchesState && matchesGender && matchesAvailability;
    });
  }, [volunteers, stateFilter, genderFilter, availabilityFilter]);

  return (
    <section className="bg-white">
      <div className="container px-6 py-12">
        <div className="space-y-6">
          <VolunteerFilters
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            availabilityFilter={availabilityFilter}
            setAvailabilityFilter={setAvailabilityFilter}
          />

          <div
            className="rounded-xl border border-[#cbe7d8] bg-[#e5f3ec] px-4 py-3 text-center text-sm font-semibold text-[#2f6b4b]"
            role="status"
          >
            <Text className="m-0">
              <strong>{filteredVolunteers.length}</strong> voluntário(s) encontrado(s).
            </Text>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredVolunteers.map((volunteer) => (
              <VolunteerCard key={volunteer.id} volunteer={volunteer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Voluntários"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Voluntários" },
        ]}
      />

      <div className="bg-white">
        <VolunteerList />
      </div>
    </main>
  );
}
