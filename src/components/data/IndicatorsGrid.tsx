import { Info, Home } from "lucide-react";
import { useState } from "react";

import type { OverviewMetrics } from "@/types/database.types";
import ShelterTypesModal from "./ShelterTypesModal";

type IndicatorsGridProps = {
  metrics: OverviewMetrics;
  year: number;
  stateLabel: string;
};

const cards: Array<{
  key: keyof OverviewMetrics;
  label: string;
  color: string;
}> = [
  { key: "totalShelters", label: "Abrigos", color: "text-white" },
  { key: "publicCount", label: "Públicos", color: "text-slate-900" },
  { key: "privateCount", label: "Privados", color: "text-slate-900" },
  { key: "mixedCount", label: "Mistos", color: "text-slate-900" },
  { key: "ltpiCount", label: "LT/P.I", color: "text-slate-900" },
];

export default function IndicatorsGrid({
  metrics,
  year,
  stateLabel,
}: IndicatorsGridProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <section aria-labelledby="overview-title" className="mt-6">
      <div className="mt-8 border-t border-gray-300 pt-4"></div>
      <div className="flex items-center gap-2 text-brand-secondary">
        <Home size={18} />
        <h3 id="overview-title" className="font-18 font-semibold">
          Visão Geral : {year} - {stateLabel}
        </h3>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {cards.map((card, index) => {
          const isPrimary = index === 0;
          return (
            <article
              key={card.key}
              className={`rounded-xl border shadow-sm ${
                isPrimary
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center px-5 py-4 text-center">
                <p
                  className={`mt-2 text-4xl font-600 leading-none ${card.color}`}
                >
                  {metrics[card.key].toLocaleString("pt-BR")}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    isPrimary ? "text-white/80" : "text-slate-700"
                  }`}
                >
                  {card.label}{" "}
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      aria-label={`Mais informações sobre ${card.label}`}
                      className="inline-flex items-center align-text-bottom text-slate-500 transition hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
                    >
                      <Info size={16} aria-hidden />
                    </button>
                  )}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <ShelterTypesModal open={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
}
