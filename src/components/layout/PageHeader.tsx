import type { JSX } from "react";
import Link from "next/link";
import clsx from "clsx";

import { Heading } from "@/components/ui/typography";

type Breadcrumb = {
  label: string;
  href?: string;
  allowActiveLink?: boolean;
};

type PageHeaderProps = {
  title: string;
  breadcrumbs?: Breadcrumb[];
  backgroundImage?: string;
  className?: string;
};

const DEFAULT_BG = "/assets/img/bg_intro.jpg";

export default function PageHeader({
  title,
  breadcrumbs = [],
  backgroundImage = DEFAULT_BG,
  className,
}: PageHeaderProps): JSX.Element {
  return (
    <section
      className={clsx(
        "relative isolate overflow-hidden bg-brand-primary text-white h-40",
        className
      )}
      aria-labelledby="page-header-title"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.031), rgba(0, 0, 0, 0.008)), url('${backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          contentVisibility: "auto",
        }}
      />
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Heading
            as="h1"
            id="page-header-title"
            className="font-30 uppercase tracking-[0.06em] text-white"
          >
            {title}
          </Heading>

          {breadcrumbs.length > 0 && (
            <nav className="mt-3" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-white md:text-base">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const shouldLink =
                    Boolean(crumb.href) &&
                    (!isLast || crumb.allowActiveLink === true);

                  const content = shouldLink ? (
                    <Link
                      href={crumb.href as string}
                      className="transition text-white hover:text-brand-accent"
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  );

                  return (
                    <li
                      key={`${crumb.label}-${index}`}
                      className="flex items-center gap-2"
                    >
                      {content}
                      {!isLast && (
                        <span aria-hidden className="opacity-80">
                          ›
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
