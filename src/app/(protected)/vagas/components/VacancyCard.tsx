"use client";

import type { JSX } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import type { VacancyCard as VacancyCardType } from "@/types/vacancy.types";
import { normalizeWorkload } from "@/app/(protected)/minhas-vagas/constants";
import { openChatWidget } from "@/components/chat-widget";

type VacancyCardProps = {
  vacancy: VacancyCardType;
  threadId?: string;
};

export default function VacancyCard({
  vacancy,
  threadId,
}: VacancyCardProps): JSX.Element {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[18px] font-semibold text-brand-primary">
          {vacancy.title}
        </h3>
        {threadId && (
          <button
            type="button"
            onClick={() => openChatWidget({ threadId })}
            title="Abrir conversa"
            className="shrink-0 cursor-pointer rounded-full p-1.5 text-brand-primary transition hover:bg-brand-primary/10"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        )}
      </div>
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
