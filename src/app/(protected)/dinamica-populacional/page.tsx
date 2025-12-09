"use client";

import type { JSX } from "react";
import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Text } from "@/components/ui/typography";
import GlossaryCard from "./components/GlossaryCard";
import GlossaryTable from "./components/GlossaryTable";
import HeaderSection from "./components/HeaderSection";
import EmptyState from "./components/EmptyState";
import Modal from "./components/Modal";
import RegisterForm from "./components/RegisterForm";
import { GLOSSARY_SECTIONS } from "./constants";
import type { RegisterFormData } from "./types";

export default function Page(): JSX.Element {
  const [isGlossaryOpen, setGlossaryOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isRegisterLtOpen, setRegisterLtOpen] = useState(false);

  const handleSubmitRegister = (values: RegisterFormData): void => {
    // TODO: Integrar com backend quando a API estiver pronta.
    console.info("Novo registro de dinâmica populacional", values);
    setRegisterOpen(false);
  };

  return (
    <main>
      <PageHeader
        title="Registrar Dinâmica Populacional"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Dinâmica Populacional" },
        ]}
      />

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
    </main>
  );
}
