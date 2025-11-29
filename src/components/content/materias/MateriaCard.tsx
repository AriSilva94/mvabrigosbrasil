import type { JSX } from "react";

import Link from "next/link";

type MateriaCardProps = {
  title: string;
  category: string;
  href: string;
};

export default function MateriaCard({
  title,
  category,
  href,
}: MateriaCardProps): JSX.Element {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link
        href={href}
        className="block px-6 py-5 no-underline"
        aria-label={title}
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-brand-primary">
          {category}
        </span>
        <h3 className="mt-2 font-18 font-semibold text-brand-secondary">
          {title}
        </h3>
      </Link>
    </article>
  );
}
