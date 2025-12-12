"use client";

import type { JSX } from "react";
import { useState } from "react";

import { Text } from "@/components/ui/typography";
import GlossaryCard from "./GlossaryCard";
import GlossaryTable from "./GlossaryTable";
import HeaderSection from "./HeaderSection";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import RegisterForm from "./RegisterForm";
import { GLOSSARY_SECTIONS } from "../constants";
import type { RegisterFormData } from "../types";

export default function PopulationDynamicsContent(): JSX.Element {
  const [isGlossaryOpen, setGlossaryOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isRegisterLtOpen, setRegisterLtOpen] = useState(false);

  const handleSubmitRegister = (values: RegisterFormData): void => {
    // TODO: Integrar com backend quando a API estiver pronta.
    console.info("Novo registro de dinâmica populacional", values);
    setRegisterOpen(false);
  };

  return (
    <>
      <section className="bg-white pb-14 pt-4">
        <div className="container px-6">
          <HeaderSection onOpenRegister={() => setRegisterOpen(true)} />

          <EmptyState onOpenRegister={() => setRegisterOpen(true)} />

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
    </>
  );
}
