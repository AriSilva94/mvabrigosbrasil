import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  icon: LucideIcon;
  iconSize?: number;
};

const BASE_CLASS = "flex items-center gap-2 color-primary";

export default function IconLink({
  href,
  icon: Icon,
  iconSize = 18,
  className,
  children,
  ...rest
}: IconLinkProps) {
  const mergedClasses = twMerge(clsx(BASE_CLASS, className));

  return (
    <Link href={href} className={mergedClasses} {...rest}>
      <Icon size={iconSize} />
      {children}
    </Link>
  );
}
