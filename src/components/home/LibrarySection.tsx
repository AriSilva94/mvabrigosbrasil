import type { JSX } from "react";

import { Heading } from "@/components/ui/typography";
import { libraryItems } from "@/data/libraryItems";
import LibraryItemsShowcase from "@/components/content/LibraryItemsShowcase";

export default function LibrarySection(): JSX.Element {
  return (
    <section
      className="bg-white py-16 md:py-24"
      aria-labelledby="library-title"
    >
      <div className="container px-6">
        <header className="text-center">
          <Heading
            as="h2"
            id="library-title"
            className="font-34 text-brand-primary"
          >
            Biblioteca do Medicina de Abrigos Brasil
          </Heading>
        </header>

        <LibraryItemsShowcase items={libraryItems.slice(0, 4)} />
      </div>
    </section>
  );
}
