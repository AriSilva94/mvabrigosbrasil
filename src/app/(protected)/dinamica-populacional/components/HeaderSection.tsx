import type { JSX } from "react";

import { Heading, Text } from "@/components/ui/typography";

type HeaderSectionProps = {
  onOpenRegister: () => void;
};

export default function HeaderSection({
  onOpenRegister,
}: HeaderSectionProps): JSX.Element {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <Heading as="h2" className="text-xl font-semibold text-slate-800">
          Dinâmica Populacional: Ariovaldo Silva
        </Heading>
        <Text className="text-sm text-slate-600">
          <strong className="font-semibold text-slate-800">Abrigando:</strong>{" "}
          — <strong className="font-semibold text-slate-800">Tipo:</strong> —
        </Text>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Baixar em Excel
        </button>
        <button
          type="button"
          onClick={onOpenRegister}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
        >
          Novo Registro
        </button>
      </div>
    </header>
  );
}
