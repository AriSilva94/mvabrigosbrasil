import type { JSX } from "react";

import { Heading, Text } from "@/components/ui/typography";
import type { PopulationUserSummary } from "../types";

type HeaderSectionProps = {
  id?: string;
  onOpenRegister: () => void;
  userSummary?: PopulationUserSummary | null;
  isReadOnly?: boolean;
  currentAnimals?: number | null;
  currentDogsCount?: number | null;
  currentCatsCount?: number | null;
};

export default function HeaderSection({
  id,
  onOpenRegister,
  userSummary,
  isReadOnly = false,
  currentAnimals,
  currentDogsCount,
  currentCatsCount,
}: HeaderSectionProps): JSX.Element {
  const displayName = userSummary?.displayName ?? "—";
  const resolvedAnimals = currentAnimals !== undefined ? currentAnimals : (userSummary?.totalAnimals ?? null);
  const resolvedDogs = currentDogsCount !== undefined ? currentDogsCount : (userSummary?.dogsCount ?? null);
  const resolvedCats = currentCatsCount !== undefined ? currentCatsCount : (userSummary?.catsCount ?? null);
  const totalAnimalsLabel =
    typeof resolvedAnimals === "number" ? `${resolvedAnimals} animais` : "—";
  const shelterTypeLabel = userSummary?.shelterTypeLabel ?? "—";
  const hasDogs = typeof resolvedDogs === "number";
  const hasCats = typeof resolvedCats === "number";
  const breakdown =
    hasDogs || hasCats
      ? [
          hasDogs ? `Cães: ${resolvedDogs ?? 0}` : null,
          hasCats ? `Gatos: ${resolvedCats ?? 0}` : null,
        ]
          .filter(Boolean)
          .join(" | ")
      : null;

  return (
    <header id={id} className="mb-8 w-full flex flex-col gap-4 rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-2">
        <Heading
          as="h2"
          className="text-xl font-semibold leading-tight text-slate-800 wrap-break-word break-all sm:wrap-break-word"
        >
          <span className="block sm:inline">Dinâmica Populacional:</span>{" "}
          <span className="block break-all sm:ml-1 sm:inline">
            {displayName}
          </span>
        </Heading>
        <Text className="text-sm leading-relaxed text-slate-600 wrap-break-word break-all sm:wrap-break-word">
          <strong className="font-semibold text-slate-800">Abrigando:</strong>{" "}
          {totalAnimalsLabel}{" "}
          {breakdown && <span className="text-slate-500">({breakdown})</span>}{" "}
          <strong className="font-semibold text-slate-800">Tipo:</strong>{" "}
          {shelterTypeLabel}
        </Text>
      </div>

      {!isReadOnly && (
        <div className="flex flex-wrap gap-3">
          {/* TODO: Definir se teremos realmente esta feature */}
          {/* <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 cursor-pointer"
          >
            Baixar em Excel
          </button> */}
          <button
            type="button"
            onClick={onOpenRegister}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary cursor-pointer"
          >
            Novo Registro
          </button>
        </div>
      )}
    </header>
  );
}
