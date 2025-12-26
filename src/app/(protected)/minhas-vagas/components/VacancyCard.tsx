"use client";

import Link from "next/link";

import { Heading, Text } from "@/components/ui/typography";
import type { VacancyProfile } from "@/types/vacancies.types";

interface VacancyCardProps {
  vacancy: VacancyProfile;
}

export default function VacancyCard({ vacancy }: VacancyCardProps) {
  const location = [vacancy.city, vacancy.state].filter(Boolean).join(" - ");
  const details = [vacancy.period, vacancy.workload].filter(Boolean).join(" · ");

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_25px_rgba(16,130,89,0.05)]">
      <div>
        <Heading as="h3" className="text-lg font-semibold text-brand-secondary">
          {vacancy.title}
        </Heading>
        {location && <Text className="text-sm text-[#68707b]">{location}</Text>}
      </div>

      {details && <Text className="text-sm text-[#68707b]">{details}</Text>}

      {vacancy.quantity && (
        <Text className="text-sm text-[#68707b]">
          Quantidade de vagas: {vacancy.quantity}
        </Text>
      )}

      {vacancy.volunteerProfile && (
        <Text className="text-sm text-[#68707b]">
          Perfil desejado: {vacancy.volunteerProfile}
        </Text>
      )}

      {vacancy.skills && (
        <Text className="text-sm text-[#68707b]">
          Habilidades ou funções: {vacancy.skills}
        </Text>
      )}

      <Link
        href={`/vaga/${vacancy.slug}`}
        className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
      >
        Ver página pública
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
