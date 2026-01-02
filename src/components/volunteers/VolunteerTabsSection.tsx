// Client-side tabbed section for the Programa de Voluntários page
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";

import { Heading, Text } from "@/components/ui/typography";
import { VOLUNTEER_TABS } from "@/constants/volunteers";
import { VOLUNTEER_FAQ } from "@/constants/volunteerFaq";
import type { VolunteerTabId } from "@/types/volunteer.types";
import type { VolunteerCard } from "@/types/volunteer.types";
import type { VacancyCard } from "@/types/vacancy.types";
import { useVolunteerCards } from "@/components/volunteers/hooks/useVolunteerCards";
import { useVacancyCards } from "@/components/volunteers/hooks/useVacancyCards";
import { FormLoading } from "@/components/loading/FormLoading";
import { ChevronDown } from "lucide-react";
import VolunteerFilters from "@/components/volunteers/VolunteerFilters";
import VacancyFiltersPublic from "@/components/volunteers/VacancyFiltersPublic";

type VolunteerTabsSectionProps = {
  initialVolunteers?: VolunteerCard[];
  initialVacancies?: VacancyCard[];
};

export default function VolunteerTabsSection({
  initialVolunteers = [],
  initialVacancies = [],
}: VolunteerTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<VolunteerTabId>("volunteers");
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    VOLUNTEER_FAQ[0]?.id ?? null
  );
  const [selectedState, setSelectedState] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedVacancyState, setSelectedVacancyState] = useState("");
  const [selectedVacancyWorkload, setSelectedVacancyWorkload] = useState("");

  const { volunteers: allVolunteers, loading: loadingVolunteers } = useVolunteerCards(initialVolunteers);
  const { vacancies: allVacancies, loading: loadingVacancies } = useVacancyCards(initialVacancies);

  // Filtrar voluntários com base nos filtros selecionados
  const volunteers = useMemo(() => {
    return allVolunteers.filter((volunteer) => {
      // Filtro por estado
      if (selectedState && volunteer.state !== selectedState) {
        return false;
      }

      // Filtro por disponibilidade
      if (selectedAvailability && volunteer.availability !== selectedAvailability) {
        return false;
      }

      return true;
    });
  }, [allVolunteers, selectedState, selectedAvailability]);

  // Filtrar vagas com base nos filtros selecionados
  const vacancies = useMemo(() => {
    return allVacancies.filter((vacancy) => {
      // Filtro por estado (verifica se o estado está na location)
      if (selectedVacancyState && !vacancy.location?.includes(selectedVacancyState)) {
        return false;
      }

      // Filtro por carga horária
      if (selectedVacancyWorkload && vacancy.workload !== selectedVacancyWorkload) {
        return false;
      }

      return true;
    });
  }, [allVacancies, selectedVacancyState, selectedVacancyWorkload]);

  function toggleFaq(id: string) {
    setOpenFaqId((current) => (current === id ? null : id));
  }

  return (
    <section className="container px-6 pb-16">
      <div className="mx-auto max-w-4xl">
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
          {activeTab === "volunteers" && (
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
                    Mostrando {volunteers.length} {volunteers.length === 1 ? "voluntário" : "voluntários"}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {volunteers.map(({ id, name, location, slug }) => (
                      <div
                        key={id}
                        className="rounded-xl border border-slate-200 px-4 py-4 shadow-[0_10px_25px_rgba(16,130,89,0.04)]"
                      >
                        <p className="text-lg font-semibold text-brand-primary">
                          {name}
                        </p>
                        {location && (
                          <p className="mt-1 text-sm text-[#68707b]">
                            {location}
                          </p>
                        )}
                        <Link
                          href={`/voluntario/${slug}?from=programa-de-voluntarios`}
                          className="mt-2 inline-block text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "vacancies" && (
            <div className="space-y-5">
              <div className="space-y-4">
                <Heading
                  as="h3"
                  className="text-[18px] font-semibold text-[#68707b]"
                >
                  Vagas Disponíveis
                </Heading>

                <VacancyFiltersPublic
                  selectedState={selectedVacancyState}
                  selectedWorkload={selectedVacancyWorkload}
                  onStateChange={setSelectedVacancyState}
                  onWorkloadChange={setSelectedVacancyWorkload}
                />
              </div>

              {loadingVacancies ? (
                <FormLoading />
              ) : vacancies.length === 0 ? (
                <div className="text-center py-8">
                  <Text className="text-[#68707b]">
                    {selectedVacancyState || selectedVacancyWorkload
                      ? "Nenhuma vaga encontrada com os filtros selecionados."
                      : "Nenhuma vaga disponível no momento."}
                  </Text>
                  {(selectedVacancyState || selectedVacancyWorkload) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVacancyState("");
                        setSelectedVacancyWorkload("");
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
                    Mostrando {vacancies.length} {vacancies.length === 1 ? "vaga" : "vagas"}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {vacancies.map(
                      ({ id, title, location, slug, period, workload }) => (
                        <div
                          key={id}
                          className="rounded-xl border border-slate-200 px-4 py-4 shadow-[0_10px_25px_rgba(16,130,89,0.04)]"
                        >
                          <p className="text-lg font-semibold text-brand-primary">
                            {title}
                          </p>
                          {(period || workload) && (
                            <p className="mt-1 text-sm text-[#68707b]">
                              {[period, workload].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {location && (
                            <p className="mt-1 text-sm text-[#68707b]">
                              {location}
                            </p>
                          )}
                          <Link
                            href={`/vaga/${slug}`}
                            className="mt-2 inline-block text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
                          >
                            Ver Vaga
                          </Link>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3">
              <Heading
                as="h3"
                className="text-[18px] font-semibold text-[#68707b]"
              >
                Perguntas Frequentes
              </Heading>
              <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(16,130,89,0.04)]">
                {VOLUNTEER_FAQ.map(({ id, question, answer }, index) => {
                  const isOpen = openFaqId === id;
                  return (
                    <div key={index}>
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
                          className={clsx(
                            "inline-flex h-5 w-5 items-center justify-center text-brand-primary"
                          )}
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
                          <div className={clsx("text-base text-[#68707b]", isOpen && "p-4")}>
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
