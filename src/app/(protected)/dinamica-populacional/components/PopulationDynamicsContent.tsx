"use client";

import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Home, PawPrint } from "lucide-react";

import { Text } from "@/components/ui/typography";
import GlossaryCard from "./GlossaryCard";
import GlossaryTable from "./GlossaryTable";
import HeaderSection from "./HeaderSection";
import Modal from "./Modal";
import RegisterForm from "./RegisterForm";
import { GLOSSARY_SECTIONS } from "../constants";
import type { PopulationUserSummary } from "../types";
import DynamicsSection from "./DynamicsSection";
import { useDynamicsData } from "../hooks/useDynamicsData";
import { parseRowPeriod } from "../utils/parseRowPeriod";
import { useRouter } from "next/navigation";

type PopulationDynamicsContentProps = {
  userSummary: PopulationUserSummary | null;
  isTeamOnly?: boolean;
  shelterWpPostId?: number | null;
};

export default function PopulationDynamicsContent({
  userSummary,
  isTeamOnly = false,
  shelterWpPostId,
}: PopulationDynamicsContentProps): JSX.Element {
  const router = useRouter();
  const [isGlossaryOpen, setGlossaryOpen] = useState(false);
  const {
    sections,
    isLoading,
    isSaving,
    isDeleting,
    isRegisterChoiceOpen,
    openRegisterChoice,
    closeRegisterChoice,
    openRegister,
    closeRegister,
    registerType,
    formInitialValues,
    editingRowId,
    isEditing,
    startEditRow,
    onSubmit,
    onDelete,
  } = useDynamicsData({ userSummary, shelterWpPostId });

  const registerTitle =
    registerType === "dinamica_lar"
      ? "Registro de Dinâmica Populacional L.T"
      : "Registro de Dinâmica Populacional";

  const existingPeriods = useMemo(() => {
    if (!registerType) return [];
    const section = sections.find((s) => s.dynamicType === registerType);
    if (!section) return [];
    return section.rows.map((row) => parseRowPeriod(row));
  }, [registerType, sections]);

  const overallPopulationCurrent = useMemo(
    () =>
      sections.reduce(
        (acc, section) => {
          acc.total += section.populationCurrent ?? 0;
          acc.dogs += section.populationCurrentDogs ?? 0;
          acc.cats += section.populationCurrentCats ?? 0;
          acc.hasValue =
            acc.hasValue ||
            section.populationCurrent !== null ||
            section.populationCurrentDogs !== null ||
            section.populationCurrentCats !== null;
          return acc;
        },
        { total: 0, dogs: 0, cats: 0, hasValue: false },
      ),
    [sections],
  );

  const canUseLtDynamics = userSummary?.hasTemporaryAgreement === true;

  return (
    <>
      <section className="bg-white pb-14 pt-4">
        <div className="container px-6">
          <HeaderSection
            id="tour-dp-header"
            onOpenRegister={openRegisterChoice}
            userSummary={userSummary}
            isReadOnly={isTeamOnly}
            currentAnimals={isLoading ? null : (sections[0]?.populationCurrent ?? null)}
            currentDogsCount={isLoading ? null : (sections[0]?.populationCurrentDogs ?? null)}
            currentCatsCount={isLoading ? null : (sections[0]?.populationCurrentCats ?? null)}
          />

          <div className="space-y-6">
            <DynamicsSection
              id="tour-dp-section"
              statsId="tour-dp-stats"
              tableId="tour-dp-table"
              data={sections[0]}
              isLoading={isLoading}
              onCreate={openRegister}
              onEditRow={
                isTeamOnly ? undefined : (id) => startEditRow("dinamica", id)
              }
              canEditPopulation={!isTeamOnly}
              onEditPopulation={() =>
                router.push(
                  "/meu-cadastro?edit=population&target=shelter#populacao-inicial",
                )
              }
              overallPopulationCurrent={
                canUseLtDynamics && overallPopulationCurrent.hasValue
                  ? overallPopulationCurrent.total
                  : null
              }
              overallPopulationCurrentDogs={
                canUseLtDynamics && overallPopulationCurrent.hasValue
                  ? overallPopulationCurrent.dogs
                  : null
              }
              overallPopulationCurrentCats={
                canUseLtDynamics && overallPopulationCurrent.hasValue
                  ? overallPopulationCurrent.cats
                  : null
              }
              isReadOnly={isTeamOnly}
            />

            <GlossaryCard id="tour-dp-glossary" onOpenGlossary={() => setGlossaryOpen(true)} />

            {canUseLtDynamics ? (
              <DynamicsSection
                id="tour-dp-lt"
                data={sections[1]}
                isLoading={isLoading}
                onCreate={openRegister}
                onEditRow={
                  isTeamOnly
                    ? undefined
                    : (id) => startEditRow("dinamica_lar", id)
                }
                canEditPopulation={!isTeamOnly}
                onEditPopulation={() =>
                  router.push(
                    "/meu-cadastro?edit=population&target=lt#populacao-inicial-lt",
                  )
                }
                overallPopulationCurrent={
                  overallPopulationCurrent.hasValue
                    ? overallPopulationCurrent.total
                    : null
                }
                overallPopulationCurrentDogs={
                  overallPopulationCurrent.hasValue
                    ? overallPopulationCurrent.dogs
                    : null
                }
                overallPopulationCurrentCats={
                  overallPopulationCurrent.hasValue
                    ? overallPopulationCurrent.cats
                    : null
                }
                isReadOnly={isTeamOnly}
              />
            ) : null}
          </div>
        </div>
      </section>

      <Modal
        title="Glossário"
        isOpen={isGlossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      >
        <GlossaryTable sections={GLOSSARY_SECTIONS} />
      </Modal>

      <Modal
        title={registerTitle}
        isOpen={Boolean(registerType)}
        onClose={closeRegister}
      >
        {registerType ? (
          <RegisterForm
            dynamicType={registerType}
            isSubmitting={isSaving}
            isDeleting={isDeleting}
            isEditing={isEditing}
            editingRowId={editingRowId ?? undefined}
            onDelete={isEditing ? onDelete : undefined}
            initialValues={formInitialValues ?? undefined}
            onSubmit={onSubmit}
            existingPeriods={existingPeriods}
          />
        ) : (
          <Text className="text-sm text-slate-700">
            Selecione o tipo de registro para continuar.
          </Text>
        )}
      </Modal>

      <Modal
        title="Escolha o tipo de registro"
        isOpen={isRegisterChoiceOpen}
        onClose={closeRegisterChoice}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => openRegister("dinamica")}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <PawPrint className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Dinâmica Populacional
              </p>
              <p className="text-xs text-slate-600">
                Registre entradas, saídas e movimentação geral dos animais.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => openRegister("dinamica_lar")}
            disabled={!canUseLtDynamics}
            className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
              !canUseLtDynamics
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer text-slate-800 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)]"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              !canUseLtDynamics ? "bg-slate-100 text-slate-400" : "bg-amber-100 text-amber-700"
            }`}>
              <Home className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${!canUseLtDynamics ? "text-slate-400" : "text-slate-900"}`}>
                Dinâmica Populacional L.T
              </p>
              <p className={`text-xs ${!canUseLtDynamics ? "text-slate-400" : "text-slate-600"}`}>
                {!canUseLtDynamics
                  ? "Disponível somente para abrigos com convênio com lares temporários."
                  : "Registros específicos para lares temporários e protetores."}
              </p>
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
}
