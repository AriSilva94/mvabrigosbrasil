"use client";

import type { JSX } from "react";
import { useState } from "react";
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

  return (
    <>
      <section className="bg-white pb-14 pt-4">
        <div className="container px-6">
          <HeaderSection
            onOpenRegister={openRegisterChoice}
            userSummary={userSummary}
            isReadOnly={isTeamOnly}
          />

          <div className="space-y-6">
            <DynamicsSection
              data={sections[0]}
              isLoading={isLoading}
              onCreate={openRegister}
              onEditRow={
                isTeamOnly ? undefined : (id) => startEditRow("dinamica", id)
              }
              canEditPopulation={!isTeamOnly}
              onEditPopulation={() =>
                router.push("/meu-cadastro?edit=population#populacao-inicial")
              }
              isReadOnly={isTeamOnly}
            />

            <GlossaryCard onOpenGlossary={() => setGlossaryOpen(true)} />

            <DynamicsSection
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
                router.push("/meu-cadastro?edit=population#populacao-inicial")
              }
              isReadOnly={isTeamOnly}
            />
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
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Home className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Dinâmica Populacional L.T
              </p>
              <p className="text-xs text-slate-600">
                Registros específicos para lares temporários e protetores.
              </p>
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
}
