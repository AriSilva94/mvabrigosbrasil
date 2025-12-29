"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Text } from "@/components/ui/typography";
import type { VacancyCard as VacancyCardType } from "@/types/vacancy.types";
import VacancyCard from "./VacancyCard";
import VacancyFilters from "./VacancyFilters";

type VacancyListClientProps = {
  vacancies: VacancyCardType[];
};

export default function VacancyListClient({ vacancies }: VacancyListClientProps): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stateFilter, setStateFilter] = useState<string>(searchParams.get("estado") ?? "");
  const [periodFilter, setPeriodFilter] = useState<string>(searchParams.get("periodo") ?? "");
  const [workloadFilter, setWorkloadFilter] = useState<string>(searchParams.get("carga") ?? "");

  const updateURL = useCallback((state: string, period: string, workload: string) => {
    const params = new URLSearchParams();

    if (state) params.set("estado", state);
    if (period) params.set("periodo", period);
    if (workload) params.set("carga", workload);

    const queryString = params.toString();
    router.push(queryString ? `/vagas?${queryString}` : "/vagas", { scroll: false });
  }, [router]);

  useEffect(() => {
    updateURL(stateFilter, periodFilter, workloadFilter);
  }, [stateFilter, periodFilter, workloadFilter, updateURL]);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((vacancy) => {
      const matchesState =
        !stateFilter ||
        vacancy.location?.toLowerCase().includes(stateFilter.toLowerCase());

      const matchesPeriod =
        !periodFilter ||
        vacancy.period?.toLowerCase() === periodFilter.toLowerCase();

      const matchesWorkload =
        !workloadFilter ||
        vacancy.workload?.toLowerCase() === workloadFilter.toLowerCase();

      return matchesState && matchesPeriod && matchesWorkload;
    });
  }, [vacancies, stateFilter, periodFilter, workloadFilter]);

  return (
    <section className="bg-white">
      <div className="container px-6 py-12">
        <div className="space-y-6">
          <VacancyFilters
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            periodFilter={periodFilter}
            setPeriodFilter={setPeriodFilter}
            workloadFilter={workloadFilter}
            setWorkloadFilter={setWorkloadFilter}
          />

          <div
            className="rounded-xl border border-[#cbe7d8] bg-[#e5f3ec] px-4 py-3 text-center text-sm font-semibold text-[#2f6b4b]"
            role="status"
          >
            <Text className="m-0">
              <strong>{filteredVacancies.length}</strong> vaga(s) encontrada(s).
            </Text>
          </div>

          {filteredVacancies.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Text className="text-slate-600">
                Nenhuma vaga encontrada com os filtros selecionados.
              </Text>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
