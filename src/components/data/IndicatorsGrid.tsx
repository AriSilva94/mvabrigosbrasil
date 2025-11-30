import { Info, Home } from "lucide-react";

import type { OverviewMetrics } from "@/types/database.types";

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
  return (
    <section aria-labelledby="overview-title" className="mt-6">
      <div className="flex items-center gap-2 text-brand-secondary">
        <Home size={18} />
        <h3 id="overview-title" className="font-18 font-semibold">
          Visão Geral : {year} - {stateLabel}
        </h3>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5">
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
                    <Info
                      size={16}
                      className="inline align-text-bottom text-slate-500"
                      aria-hidden
                    />
                  )}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
