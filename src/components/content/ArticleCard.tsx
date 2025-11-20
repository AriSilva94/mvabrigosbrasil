import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";

type ArticleCardProps = {
  title: string;
  category: string;
  href: string;
  imageSrc: string;
};

export default function ArticleCard({
  title,
  category,
  href,
  imageSrc,
}: ArticleCardProps): JSX.Element {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={href} target="_blank" rel="noreferrer">
        <Image
          src={imageSrc}
          alt={title}
          width={600}
          height={840}
          className="h-64 w-full object-cover sm:h-72"
          unoptimized
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <span className="text-sm font-semibold text-brand-primary">
          {category}
        </span>
        <h3 className="font-16 font-semibold leading-snug text-brand-secondary">
          {title}
        </h3>
      </div>
    </article>
  );
}
