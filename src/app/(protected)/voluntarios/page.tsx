"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PageHeader from "@/components/layout/PageHeader";
import { Text } from "@/components/ui/typography";
import VolunteerCard from "./components/VolunteerCard";
import VolunteerFilters from "./components/VolunteerFilters";
import { useVolunteerCards } from "@/components/volunteers/hooks/useVolunteerCards";

function VolunteerList(): JSX.Element {
  const volunteers = useVolunteerCards();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stateFilter, setStateFilter] = useState<string>(searchParams.get("estado") ?? "");
  const [genderFilter, setGenderFilter] = useState<string>(searchParams.get("genero") ?? "");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>(searchParams.get("disponibilidade") ?? "");

  const updateURL = useCallback((state: string, gender: string, availability: string) => {
    const params = new URLSearchParams();

    if (state) params.set("estado", state);
    if (gender) params.set("genero", gender);
    if (availability) params.set("disponibilidade", availability);

    const queryString = params.toString();
    router.push(queryString ? `/voluntarios?${queryString}` : "/voluntarios", { scroll: false });
  }, [router]);

  useEffect(() => {
    updateURL(stateFilter, genderFilter, availabilityFilter);
  }, [stateFilter, genderFilter, availabilityFilter, updateURL]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const matchesState =
        !stateFilter ||
        volunteer.state?.toLowerCase() === stateFilter.toLowerCase();

      const matchesGender =
        !genderFilter ||
        volunteer.gender?.toLowerCase() === genderFilter.toLowerCase();

      const matchesAvailability =
        !availabilityFilter ||
        volunteer.availability === availabilityFilter;

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
