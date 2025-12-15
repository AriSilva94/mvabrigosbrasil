import type { ReactNode } from "react";
import Link from "next/link";

import { LEGAL_LINKS } from "@/constants/legal";

type LegalPageLayoutProps = {
  activePath: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  activePath,
  children,
}: LegalPageLayoutProps) {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10 lg:gap-12">
          <nav
            aria-label="Navegação de políticas"
            className="w-full shrink-0 md:w-64 lg:w-72"
          >
            <ul className="rounded-md border border-gray-200 bg-white shadow-sm">
              {LEGAL_LINKS.map(({ label, href }) => {
                const isActive = href === activePath;
                const linkClasses =
                  "block px-4 py-3 text-sm font-semibold transition";

                return (
                  <li key={href} className="border-b border-gray-200 last:border-none">
                    <Link
                      href={href}
                      className={
                        isActive
                          ? `${linkClasses} bg-brand-primary text-white`
                          : `${linkClasses} text-brand-primary hover:bg-brand-primary/10`
                      }
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <article className="flex-1 space-y-8 text-color-secondary">{children}</article>
        </div>
      </div>
    </section>
  );
}
