import type { JSX } from "react";
import clsx from "clsx";

import IconLink from "@/components/ui/IconLink";
import type { ProjectLink } from "@/types/who-we-are.types";

type ProjectLinksListProps = {
  links: ProjectLink[];
  className?: string;
  linkClassName?: string;
  iconSize?: number;
};

export default function ProjectLinksList({
  links,
  className,
  linkClassName,
  iconSize = 20,
}: ProjectLinksListProps): JSX.Element {
  const containerClasses = clsx(
    "flex flex-wrap justify-start gap-4 text-brand-primary",
    className,
  );
  const linkClasses = clsx(
    "rounded-full bg-brand-primary/5 px-4 py-2 font-semibold transition hover:bg-brand-primary/10",
    linkClassName,
  );

  return (
    <div className={containerClasses}>
      {links.map(({ label, href, icon }) => (
        <IconLink
          key={href}
          href={href}
          icon={icon}
          className={linkClasses}
          iconSize={iconSize}
        >
          {label}
        </IconLink>
      ))}
    </div>
  );
}
