import type { JSX } from "react";
import { Info } from "lucide-react";

import { SHELTER_TYPE_OPTIONS } from "@/constants/shelterProfile";
import { Heading, Text } from "@/components/ui/typography";

// Compact helper to keep the layout clean but still accessible
export default function ShelterTypeHelp(): JSX.Element {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#4f5464]">
          <Info className="h-5 w-5 text-brand-primary" aria-hidden />
          <Heading as="h4" className="text-base font-semibold text-[#4f5464]">
            Tipos de Abrigo
          </Heading>
        </div>
        <span className="text-sm font-medium text-brand-primary underline-offset-4 group-open:underline">
          Ver detalhes
        </span>
      </summary>

      <div className="mt-3 space-y-2">
        {SHELTER_TYPE_OPTIONS.map(({ value, label, description }) => (
          <Text key={value} className="text-sm leading-relaxed text-[#6b7280]">
            <strong className="text-[#4f5464]">{label}:</strong> {description}
          </Text>
        ))}
      </div>
    </details>
  );
}
