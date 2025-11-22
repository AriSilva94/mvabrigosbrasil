import type { JSX } from "react";
import Link from "next/link";

import AppImage from "@/components/ui/AppImage";
type LibraryItemCardProps = {
  title: string;
  category: string;
  href: string;
  imageSrc: string;
};

export default function LibraryItemCard({
  title,
  category,
  href,
  imageSrc,
}: LibraryItemCardProps): JSX.Element {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={href}>
        <AppImage
          src={imageSrc}
          alt={title}
          width={600}
          height={840}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="h-64 w-full object-cover sm:h-72"
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
