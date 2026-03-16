// Client-side tabbed section for the Programa de Voluntários page
"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";

import { Heading, Text } from "@/components/ui/typography";
import { VOLUNTEER_TABS, VOLUNTEER_TAB_IDS } from "@/constants/volunteers";
import { VOLUNTEER_FAQ } from "@/constants/volunteerFaq";
import type { VolunteerTabId, VolunteerCard as VolunteerCardType } from "@/types/volunteer.types";
import type { VacancyCard as VacancyCardData } from "@/types/vacancy.types";
import { useVolunteerCards } from "@/components/volunteers/hooks/useVolunteerCards";
import { FormLoading } from "@/components/loading/FormLoading";
import { ChevronDown } from "lucide-react";
import VolunteerFilters from "@/components/volunteers/VolunteerFilters";
import VacancyFilters from "@/app/(protected)/vagas/components/VacancyFilters";
import VacancyCard from "@/app/(protected)/vagas/components/VacancyCard";
import VolunteerCard from "@/app/(protected)/voluntarios/components/VolunteerCard";
import { filterVacancies } from "@/lib/filterVacancies";

type VolunteerTabsSectionProps = {
  initialVolunteers?: VolunteerCardType[];
  initialVacancies?: VacancyCardData[];
};

export default function VolunteerTabsSection({
  initialVolunteers = [],
  initialVacancies = [],
}: VolunteerTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<VolunteerTabId>(VOLUNTEER_TAB_IDS.VOLUNTEERS);
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    VOLUNTEER_FAQ[0]?.id ?? null
  );
  const [selectedState, setSelectedState] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [vacancyStateFilter, setVacancyStateFilter] = useState("");
  const [vacancyPeriodFilter, setVacancyPeriodFilter] = useState("");
  const [vacancyWorkloadFilter, setVacancyWorkloadFilter] = useState("");

  const { volunteers: allVolunteers, loading: loadingVolunteers } =
    useVolunteerCards(initialVolunteers);

  const volunteers = useMemo(() => {
    return allVolunteers.filter((volunteer) => {
      if (selectedState && volunteer.state !== selectedState) return false;
      if (selectedAvailability && volunteer.availability !== selectedAvailability) return false;
      return true;
    });
  }, [allVolunteers, selectedState, selectedAvailability]);

  const filteredVacancies = useMemo(
    () =>
      filterVacancies(initialVacancies, {
        stateFilter: vacancyStateFilter,
        periodFilter: vacancyPeriodFilter,
        workloadFilter: vacancyWorkloadFilter,
      }),
    [initialVacancies, vacancyStateFilter, vacancyPeriodFilter, vacancyWorkloadFilter]
  );

  function toggleFaq(id: string) {
    setOpenFaqId((current) => (current === id ? null : id));
  }

  return (
    <section className="flex items-center justify-center px-4 md:px-6">
      <div className="mx-auto w-full max-w-5xl rounded-3xl py-4 md:py-10 md:px-10">
        <nav className="flex flex-col items-stretch gap-2 border-b border-slate-200 pb-3 md:flex-row md:items-center md:gap-4">
          {VOLUNTEER_TABS.map(({ id, label }) => {
            const isActive = id === activeTab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={clsx(
                  "w-full rounded-md px-4 py-2 text-left text-sm font-semibold transition cursor-pointer md:w-auto md:text-center",
                  isActive
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-[#68707b] hover:text-brand-primary"
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl bg-white px-6 py-6 shadow-[0_15px_40px_rgba(16,130,89,0.05)]">
          {activeTab === VOLUNTEER_TAB_IDS.VOLUNTEERS && (
            <div className="space-y-5">
              <div className="space-y-4">
                <Heading
                  as="h3"
                  className="text-[18px] font-semibold text-[#68707b]"
                >
                  Voluntários Disponíveis
                </Heading>

                <VolunteerFilters
                  selectedState={selectedState}
                  selectedAvailability={selectedAvailability}
                  onStateChange={setSelectedState}
                  onAvailabilityChange={setSelectedAvailability}
                />
              </div>

              {loadingVolunteers ? (
                <FormLoading />
              ) : volunteers.length === 0 ? (
                <div className="text-center py-8">
                  <Text className="text-[#68707b]">
                    {selectedState || selectedAvailability
                      ? "Nenhum voluntário encontrado com os filtros selecionados."
                      : "Nenhum voluntário disponível no momento."}
                  </Text>
                  {(selectedState || selectedAvailability) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedState("");
                        setSelectedAvailability("");
                      }}
                      className="mt-3 text-sm font-semibold text-brand-primary hover:underline"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-[#68707b]">
                    Mostrando {volunteers.length}{" "}
                    {volunteers.length === 1 ? "voluntário" : "voluntários"}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {volunteers.map((volunteer) => (
                      <VolunteerCard
                        key={volunteer.id}
                        volunteer={volunteer}
                        from="voluntarios"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === VOLUNTEER_TAB_IDS.VAGAS && (
            <div className="space-y-5">
              <div className="space-y-4">
                <Heading
                  as="h3"
                  className="text-[18px] font-semibold text-[#68707b]"
                >
                  Vagas Disponíveis
                </Heading>

                <VacancyFilters
                  stateFilter={vacancyStateFilter}
                  setStateFilter={setVacancyStateFilter}
                  periodFilter={vacancyPeriodFilter}
                  setPeriodFilter={setVacancyPeriodFilter}
                  workloadFilter={vacancyWorkloadFilter}
                  setWorkloadFilter={setVacancyWorkloadFilter}
                />
              </div>

              {filteredVacancies.length === 0 ? (
                <div className="text-center py-8">
                  <Text className="text-[#68707b]">
                    {vacancyStateFilter || vacancyPeriodFilter || vacancyWorkloadFilter
                      ? "Nenhuma vaga encontrada com os filtros selecionados."
                      : "Nenhuma vaga disponível no momento."}
                  </Text>
                  {(vacancyStateFilter || vacancyPeriodFilter || vacancyWorkloadFilter) && (
                    <button
                      type="button"
                      onClick={() => {
                        setVacancyStateFilter("");
                        setVacancyPeriodFilter("");
                        setVacancyWorkloadFilter("");
                      }}
                      className="mt-3 text-sm font-semibold text-brand-primary hover:underline"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-[#68707b]">
                    Mostrando {filteredVacancies.length}{" "}
                    {filteredVacancies.length === 1 ? "vaga" : "vagas"}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredVacancies.map((vacancy) => (
                      <VacancyCard key={vacancy.id} vacancy={vacancy} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === VOLUNTEER_TAB_IDS.FAQ && (
            <div className="space-y-3">
              <Heading
                as="h3"
                className="text-[18px] font-semibold text-[#68707b]"
              >
                Perguntas Frequentes
              </Heading>
              <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(16,130,89,0.04)]">
                {VOLUNTEER_FAQ.map(({ id, question, answer }) => {
                  const isOpen = openFaqId === id;
                  return (
                    <div key={id}>
                      <button
                        type="button"
                        onClick={() => toggleFaq(id)}
                        className={clsx(
                          "flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-brand-primary transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
                          isOpen
                            ? "bg-brand-primary/15"
                            : "hover:bg-brand-primary/10"
                        )}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${id}`}
                      >
                        <span>{`${id} - ${question}`}</span>
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center text-brand-primary"
                          aria-hidden
                        >
                          <ChevronDown
                            className={clsx(
                              "h-4 w-4 transition-transform duration-300 ease-in-out",
                              isOpen && "rotate-180"
                            )}
                          />
                        </span>
                      </button>
                      <div
                        id={`faq-panel-${id}`}
                        className="overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out"
                        style={{
                          display: "grid",
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                        }}
                        aria-hidden={!isOpen}
                      >
                        <div className="overflow-hidden">
                          <div
                            className={clsx(
                              "text-base text-[#68707b]",
                              isOpen && "p-4"
                            )}
                          >
                            {answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
