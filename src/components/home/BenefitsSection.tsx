"use client";

import type { JSX } from "react";
import { useState } from "react";
import {
  BarChart3,
  Activity,
  Settings,
  Database,
  ClipboardCheck,
  Gauge,
  BarChartHorizontal,
  BookOpen,
  Users,
  Wallet,
  Workflow,
  CheckSquare,
} from "lucide-react";

import type { BenefitItem } from "@/types/home.types";

const NATIONAL_BENEFITS: BenefitItem[] = [
  {
    title: "Políticas Públicas Eficazes",
    description:
      "Ajuda a promover políticas públicas mais eficazes para os animais.",
  },
  {
    title: "Estimativa Populacional",
    description: "Ajuda a estimar o número de animais abandonados e em risco.",
  },
  {
    title: "Melhores Operações",
    description: "Auxilia a promover melhores práticas e operações.",
  },
  {
    title: "Banco de Dados Nacional",
    description:
      "Promove um conjunto completo, real e atualizado de dados nacional anual.",
  },
  {
    title: "Avaliação de Resultados",
    description:
      "Auxilia na avaliação dos resultados das estratégias de manejo de cães e gatos abandonados ou em situação de rua.",
  },
  {
    title: "Melhor Alocação de Recursos",
    description:
      "Facilita a alocação eficaz de recursos do governo e organizações de bem-estar animal.",
  },
];

const SHELTER_BENEFITS: BenefitItem[] = [
  {
    title: "Estatística",
    description: "Analisar tendências de resgates ao longo dos meses e anos.",
    icon: <BarChartHorizontal className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Avaliação",
    description:
      "Avaliar padrões de doações de recursos por períodos temporais.",
    icon: <ClipboardCheck className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Identificação",
    description:
      "Identificar épocas de pico em adoções através de análise temporal.",
    icon: <Activity className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Planejamento",
    description: "Planejar financeiramente com base em projeções futuras.",
    icon: <Wallet className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Mapeamento",
    description:
      "Mapear prevalência de doenças na população abrigada por épocas.",
    icon: <MapSectionIcon />,
  },
  {
    title: "Conhecimento",
    description:
      "Estudar incidência e períodos de devolução de animais adotados.",
    icon: <BookOpen className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Necessidades",
    description: "Reconhecer necessidades estruturais, financeiras e humanas.",
    icon: <Settings className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Fluxo Médio",
    description: "Determinar fluxo médio anual de entrada e saída de animais.",
    icon: <Users className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Custos",
    description: "Comparar custo-benefício entre abrigos e lares temporários.",
    icon: <Wallet className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Estratégia",
    description:
      "Verificar efetividade de planos estratégicos ao longo do tempo.",
    icon: <Workflow className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Desempenho",
    description: "Contrastar desempenho do abrigo em diferentes períodos.",
    icon: <Gauge className="h-10 w-10 text-brand-accent" />,
  },
  {
    title: "Metas",
    description: "Avaliar cumprimento de metas e objetivos do abrigo.",
    icon: <CheckSquare className="h-10 w-10 text-brand-accent" />,
  },
];

const NATIONAL_HEADING =
  "Por que é importante a NÍVEL NACIONAL mapear e coletar os dados da dinâmica populacional de abrigos de animais?";
const SHELTER_HEADING =
  "Por que é importante PARA O ABRIGO registrar e coletar os dados da dinâmica populacional?";

const SLIDER_CONTROL_CLASS =
  "rounded-full border border-slate-300 px-3 py-2 text-brand-primary transition hover:border-brand-primary";
const SLIDER_DOT_ACTIVE = "w-6 bg-brand-accent";
const SLIDER_DOT_INACTIVE = "w-3 bg-slate-300";

const SLIDER_ICONS = {
  previous: "‹",
  next: "›",
} as const;

export default function BenefitsSection(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  const current = SHELTER_BENEFITS[activeIndex];

  const handleNext = () =>
    setActiveIndex((prevIndex) => (prevIndex + 1) % SHELTER_BENEFITS.length);
  const handlePrev = () =>
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + SHELTER_BENEFITS.length) % SHELTER_BENEFITS.length
    );

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <div className="text-center space-y-3">
          <p className="font-20 font-600 text-brand-accent">
            Nossos Benefícios
          </p>
          <h2 className="font-600 font-34 text-brand-primary">
            {NATIONAL_HEADING}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {NATIONAL_BENEFITS.map(({ title, description }) => (
            <article
              key={title}
              className="flex h-full flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-600 font-20 text-brand-primary">{title}</h3>
              </div>
              <p className="font-16 text-color-secondary">{description}</p>
            </article>
          ))}
        </div>

        <div className="text-center space-y-3">
          <h2 className="font-600 font-34 text-brand-primary">
            {SHELTER_HEADING}
          </h2>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-light p-8 shadow-sm">
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous benefit"
              className={SLIDER_CONTROL_CLASS}
            >
              {SLIDER_ICONS.previous}
            </button>
            <div className="text-center">
              <div className="flex justify-center">{current.icon}</div>
              <p className="mt-2 font-600 font-20 text-brand-primary">
                {activeIndex + 1}. {current.title}
              </p>
              <p className="font-16 text-color-secondary">
                {current.description}
              </p>
            </div>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next benefit"
              className="rounded-full border border-slate-300 px-3 py-2 text-brand-primary transition hover:border-brand-primary"
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-2">
            {SHELTER_BENEFITS.map((_, idx) => (
              <span
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? SLIDER_DOT_ACTIVE : SLIDER_DOT_INACTIVE
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSectionIcon(): JSX.Element {
  return (
    <svg
      className="h-10 w-10 text-brand-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75 4.5 4.5v13.75l4.75 2.25 5-2.75 4.25 2.25V6.25L14.5 4l-5.5 2.75v13.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75v13.5m5.5-16.25v13.25m4.25-11-4.25-2"
      />
    </svg>
  );
}
