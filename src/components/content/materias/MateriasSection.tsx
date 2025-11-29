import type { JSX } from "react";

import MateriaCard from "./MateriaCard";

type MateriasSectionProps = {
  heading: string;
  items: ReadonlyArray<{
    title: string;
    category: string;
    href: string;
  }>;
};

export default function MateriasSection({
  heading,
  items,
}: MateriasSectionProps): JSX.Element {
  return (
    <section aria-labelledby="materias-heading" className="bg-white py-16 md:py-20">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="materias-heading"
            className="font-30 font-semibold text-brand-secondary"
          >
            {heading}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14">
          {items.map((item) => (
            <MateriaCard
              key={item.href}
              title={item.title}
              category={item.category}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
