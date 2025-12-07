import type { JSX } from "react";
import Link from "next/link";

import type { VolunteerCard as VolunteerCardType } from "@/types/volunteer.types";

type VolunteerCardProps = {
  volunteer: VolunteerCardType;
};

export default function VolunteerCard({ volunteer }: VolunteerCardProps): JSX.Element {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(16,130,89,0.08)]">
      <h3 className="text-[18px] font-semibold text-brand-primary">{volunteer.name}</h3>
      {volunteer.location && (
        <p className="mt-1 text-sm text-[#6b7280]">{volunteer.location}</p>
      )}
      <Link
        href={`/voluntario/${volunteer.slug}?from=voluntarios`}
        className="mt-3 inline-block text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
      >
        Ver Perfil
      </Link>
    </article>
  );
}
