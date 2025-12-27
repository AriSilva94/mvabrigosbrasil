"use client";

import type { JSX } from "react";
import { useState } from "react";
import { Home, PawPrint } from "lucide-react";

import { Text } from "@/components/ui/typography";
import GlossaryCard from "./GlossaryCard";
import GlossaryTable from "./GlossaryTable";
import HeaderSection from "./HeaderSection";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import RegisterForm from "./RegisterForm";
import { GLOSSARY_SECTIONS } from "../constants";
import type { PopulationUserSummary, RegisterFormData } from "../types";

type PopulationDynamicsContentProps = {
  userSummary: PopulationUserSummary | null;
};

export default function PopulationDynamicsContent({
  userSummary,
}: PopulationDynamicsContentProps): JSX.Element {
  const [isGlossaryOpen, setGlossaryOpen] = useState(false);
  const [isRegisterChoiceOpen, setRegisterChoiceOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isRegisterLtOpen, setRegisterLtOpen] = useState(false);

  const handleSubmitRegister = (values: RegisterFormData): void => {
    // TODO: Integrar com backend quando a API estiver pronta.
    console.info("Novo registro de dinâmica populacional", values);
    setRegisterOpen(false);
  };

  const openRegisterChoice = (): void => setRegisterChoiceOpen(true);
  const handleSelectRegister = (): void => {
    setRegisterChoiceOpen(false);
    setRegisterOpen(true);
  };
  const handleSelectRegisterLt = (): void => {
    setRegisterChoiceOpen(false);
    setRegisterLtOpen(true);
  };

  return (
    <>
      <section className="bg-white pb-14 pt-4">
        <div className="container px-6">
          <HeaderSection
            onOpenRegister={openRegisterChoice}
            userSummary={userSummary}
          />

          <EmptyState onOpenRegister={openRegisterChoice} />

          <GlossaryCard onOpenGlossary={() => setGlossaryOpen(true)} />
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
        title="Registro de Dinâmica Populacional"
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
      >
        <RegisterForm onSubmit={handleSubmitRegister} />
      </Modal>

      <Modal
        title="Registro de Dinâmica Populacional L.T"
        isOpen={isRegisterLtOpen}
        onClose={() => setRegisterLtOpen(false)}
      >
        <Text className="text-sm text-slate-700">
          O formulário de registro para lares temporários está em construção.
        </Text>
      </Modal>

      <Modal
        title="Escolha o tipo de registro"
        isOpen={isRegisterChoiceOpen}
        onClose={() => setRegisterChoiceOpen(false)}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={handleSelectRegister}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
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
            onClick={handleSelectRegisterLt}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
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
