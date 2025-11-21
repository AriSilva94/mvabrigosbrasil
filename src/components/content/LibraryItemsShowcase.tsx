import type { JSX } from "react";
import Link from "next/link";

import AppImage from "@/components/ui/AppImage";
import { Text } from "@/components/ui/typography";
import type { LibraryItem } from "@/data/libraryItems";

type LibraryItemsShowcaseProps = {
  items: LibraryItem[];
  viewAllHref?: string;
  viewAllLabel?: string;
};

export default function LibraryItemsShowcase({
  items,
  viewAllHref = "/biblioteca",
  viewAllLabel = "Ir para Biblioteca",
}: LibraryItemsShowcaseProps): JSX.Element {
  return (
    <>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ title, category, imageSrc, slug }) => (
          <article
            key={slug}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <Link href={`/biblioteca/${slug}`}>
              <AppImage
                src={imageSrc}
                alt={title}
                width={600}
                height={840}
                className="h-full w-full object-contain"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-2 px-5 py-4">
              <span className="text-sm font-semibold text-brand-primary">
                {category}
              </span>
              <Text className="font-20 leading-snug text-brand-secondary">
                {title}
              </Text>
            </div>
          </article>
        ))}
      </div>

      {viewAllHref ? (
        <div className="mt-10 flex justify-center">
          <Link href={viewAllHref} className="btn-sample">
            {viewAllLabel}
          </Link>
        </div>
      ) : null}
    </>
  );
}
