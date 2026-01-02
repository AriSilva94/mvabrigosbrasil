"use client";

import Link from "next/link";
import { useState } from "react";

import { Heading, Text } from "@/components/ui/typography";
import type { VacancyProfile } from "@/types/vacancies.types";
import { normalizeWorkload } from "@/app/(protected)/minhas-vagas/constants";
import DeleteVacancyDialog from "@/app/(protected)/minhas-vagas/components/DeleteVacancyDialog";

interface VacancyCardProps {
  vacancy: VacancyProfile;
  showEditLink?: boolean;
  editHref?: string;
  onDeleted?: () => void;
}

export default function VacancyCard({
  vacancy,
  showEditLink = false,
  editHref,
  onDeleted,
}: VacancyCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const location = [vacancy.city, vacancy.state].filter(Boolean).join(" - ");
  const details = [vacancy.period, normalizeWorkload(vacancy.workload)].filter(Boolean).join(" · ");
  const slug = vacancy.slug || vacancy.id;

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
          Vagas disponíveis: {vacancy.quantity}
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

      <div className="mt-auto flex flex-wrap gap-2">
        {showEditLink && slug && (
          <>
            <Link
              href={editHref ?? `/vaga/${slug}`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f5f5f6] px-3 py-1 text-sm font-semibold text-brand-secondary transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,130,89,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary"
            >
              Editar
            </Link>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(220,53,69,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Excluir
            </button>
          </>
        )}
      </div>

      {onDeleted && (
        <DeleteVacancyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          vacancyId={vacancy.id}
          vacancyTitle={vacancy.title}
          onDeleted={onDeleted}
        />
      )}
    </article>
  );
}
