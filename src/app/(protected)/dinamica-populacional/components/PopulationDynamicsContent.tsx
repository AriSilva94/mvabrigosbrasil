"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Home, PawPrint } from "lucide-react";

import { Text } from "@/components/ui/typography";
import GlossaryCard from "./GlossaryCard";
import GlossaryTable from "./GlossaryTable";
import HeaderSection from "./HeaderSection";
import Modal from "./Modal";
import RegisterForm from "./RegisterForm";
import { GLOSSARY_SECTIONS } from "../constants";
import type {
  DynamicType,
  PopulationUserSummary,
  RegisterFormSubmit,
  DynamicsDisplay,
  RateCardData,
} from "../types";
import DynamicsSection from "./DynamicsSection";

type PopulationDynamicsContentProps = {
  userSummary: PopulationUserSummary | null;
};

export default function PopulationDynamicsContent({
  userSummary,
}: PopulationDynamicsContentProps): JSX.Element {
  const [isGlossaryOpen, setGlossaryOpen] = useState(false);
  const [isRegisterChoiceOpen, setRegisterChoiceOpen] = useState(false);
  const [registerType, setRegisterType] = useState<DynamicType | null>(null);
  const [sections, setSections] = useState<DynamicsDisplay[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  const baseStats: RateCardData[] = [
    { key: "entry", label: "Taxa de Entrada", value: null, trend: "neutral" },
    { key: "exit", label: "Taxa de Saída", value: null, trend: "neutral" },
    {
      key: "adoption",
      label: "Taxa de Adoção",
      value: null,
      trend: "neutral",
    },
    {
      key: "mortality",
      label: "Taxa de Mortalidade",
      value: null,
      trend: "neutral",
    },
    {
      key: "morbidity",
      label: "Taxa de Morbidade",
      value: null,
      trend: "neutral",
    },
  ];
  const fallbackSections: DynamicsDisplay[] = [
    {
      dynamicType: "dinamica",
      title: "Dinâmica Populacional",
      populationInitial: userSummary?.totalAnimals ?? null,
      populationInitialDogs: userSummary?.dogsCount ?? null,
      populationInitialCats: userSummary?.catsCount ?? null,
      populationCurrent: userSummary?.totalAnimals ?? null,
      stats: [...baseStats],
      rows: [],
    },
    {
      dynamicType: "dinamica_lar",
      title: "Dinâmica Populacional L.T",
      populationInitial: userSummary?.totalAnimals ?? null,
      populationInitialDogs: userSummary?.dogsCount ?? null,
      populationInitialCats: userSummary?.catsCount ?? null,
      populationCurrent: userSummary?.totalAnimals ?? null,
      stats: [...baseStats],
      rows: [],
    },
  ];

  const fetchSections = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch("/api/dynamics", { cache: "no-store" });
      if (!response.ok) {
        setSections(fallbackSections);
        setLoading(false);
        return;
      }
      const json = (await response.json()) as { sections?: DynamicsDisplay[] };
      setSections(json.sections ?? fallbackSections);
    } catch (error) {
      console.error("dinamica-populacional: falha ao carregar dados", error);
      setSections(fallbackSections);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSections();
  }, []);

  const handleSubmitRegister = async (values: RegisterFormSubmit): Promise<void> => {
    setSaving(true);
    try {
      const response = await fetch("/api/dynamics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        console.error("Erro ao salvar registro de dinâmica");
      } else {
        const json = (await response.json()) as { sections?: DynamicsDisplay[] };
        setSections(json.sections ?? fallbackSections);
      }
    } catch (error) {
      console.error("dinamica-populacional: falha ao salvar registro", error);
    } finally {
      setSaving(false);
      setRegisterType(null);
    }
  };

  const openRegisterChoice = (): void => setRegisterChoiceOpen(true);
  const handleSelectRegister = (type: DynamicType): void => {
    setRegisterChoiceOpen(false);
    setRegisterType(type);
  };

  const closeRegister = (): void => setRegisterType(null);

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
          />

          <div className="space-y-6">
            <DynamicsSection
              data={sections[0] ?? fallbackSections[0]}
              isLoading={isLoading}
              onCreate={handleSelectRegister}
            />

            <GlossaryCard onOpenGlossary={() => setGlossaryOpen(true)} />

            <DynamicsSection
              data={sections[1] ?? fallbackSections[1]}
              isLoading={isLoading}
              onCreate={handleSelectRegister}
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
            onSubmit={handleSubmitRegister}
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
        onClose={() => setRegisterChoiceOpen(false)}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSelectRegister("dinamica")}
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
            onClick={() => handleSelectRegister("dinamica_lar")}
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
