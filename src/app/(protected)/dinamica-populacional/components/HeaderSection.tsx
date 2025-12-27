import type { JSX } from "react";

import { Heading, Text } from "@/components/ui/typography";
import type { PopulationUserSummary } from "../types";

type HeaderSectionProps = {
  onOpenRegister: () => void;
  userSummary?: PopulationUserSummary | null;
};

export default function HeaderSection({
  onOpenRegister,
  userSummary,
}: HeaderSectionProps): JSX.Element {
  const displayName = userSummary?.displayName ?? "—";
  const totalAnimalsLabel =
    typeof userSummary?.totalAnimals === "number"
      ? `${userSummary.totalAnimals} animais`
      : "—";
  const shelterTypeLabel = userSummary?.shelterTypeLabel ?? "—";
  const hasDogs = typeof userSummary?.dogsCount === "number";
  const hasCats = typeof userSummary?.catsCount === "number";
  const breakdown =
    hasDogs || hasCats
      ? [
          hasDogs ? `Cães: ${userSummary?.dogsCount ?? 0}` : null,
          hasCats ? `Gatos: ${userSummary?.catsCount ?? 0}` : null,
        ]
          .filter(Boolean)
          .join(" | ")
      : null;

  return (
    <header className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <Heading as="h2" className="text-xl font-semibold text-slate-800">
          Dinâmica Populacional: {displayName}
        </Heading>
        <Text className="text-sm text-slate-600">
          <strong className="font-semibold text-slate-800">Abrigando:</strong>{" "}
          {totalAnimalsLabel}{" "}
          {breakdown && (
            <span className="text-slate-500">({breakdown})</span>
          )}{" "}
          <strong className="font-semibold text-slate-800">Tipo:</strong>{" "}
          {shelterTypeLabel}
        </Text>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 cursor-pointer"
        >
          Baixar em Excel
        </button>
        <button
          type="button"
          onClick={onOpenRegister}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary cursor-pointer"
        >
          Novo Registro
        </button>
      </div>
    </header>
  );
}
