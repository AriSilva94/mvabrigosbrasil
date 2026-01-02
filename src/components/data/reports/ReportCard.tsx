import type { JSX } from "react";

import Image from "next/image";
import Link from "next/link";

type ReportCardProps = {
  title: string;
  description: string;
  href: string;
  image: string;
};

export default function ReportCard({
  title,
  description,
  href,
  image,
}: ReportCardProps): JSX.Element {
  const isExternalLink = href.startsWith("http");

  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
      <div className="flex-shrink-0">
        <Image
          src={image}
          alt={title}
          width={240}
          height={320}
          className="h-48 w-auto rounded-2xl object-cover sm:h-56"
          sizes="(max-width: 640px) 100vw, 240px"
        />
      </div>
      <div className="flex flex-col">
        <h2 className="font-24 font-semibold text-brand-secondary">{title}</h2>
        <p className="mt-3 text-base text-slate-600">{description}</p>

        <Link
          href={href}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noreferrer" : undefined}
          className="mt-6 inline-flex w-fit items-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary"
        >
          Acessar
        </Link>
      </div>
    </article>
  );
}
