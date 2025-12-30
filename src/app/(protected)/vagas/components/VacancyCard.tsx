import type { JSX } from "react";
import Link from "next/link";

import type { VacancyCard as VacancyCardType } from "@/types/vacancy.types";
import { normalizeWorkload } from "@/app/(protected)/minhas-vagas/constants";

type VacancyCardProps = {
  vacancy: VacancyCardType;
};

export default function VacancyCard({
  vacancy,
}: VacancyCardProps): JSX.Element {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)]">
      <h3 className="text-[18px] font-semibold text-brand-primary">
        {vacancy.title}
      </h3>
      {(vacancy.period || vacancy.workload) && (
        <p className="mt-1 text-sm text-[#6b7280]">
          {[vacancy.period, normalizeWorkload(vacancy.workload)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {vacancy.location && (
        <p className="mt-1 text-sm text-[#6b7280]">{vacancy.location}</p>
      )}
      <Link
        href={`/vaga/${vacancy.slug}`}
        className="mt-3 inline-block text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
      >
        Ver Vaga
      </Link>
    </article>
  );
}
