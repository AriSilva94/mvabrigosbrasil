import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary";
};

const BASE_CLASS = "btn-sample-lg";
const VARIANT_CLASS: Record<NonNullable<ButtonLinkProps["variant"]>, string> = {
  primary: "",
  secondary: " bg-secondary",
};

export default function ButtonLink({
  href,
  className,
  variant = "primary",
  children,
  ...rest
}: ButtonLinkProps) {
  const mergedClasses = twMerge(
    clsx(BASE_CLASS, VARIANT_CLASS[variant], className)
  );

  return (
    <Link href={href} className={mergedClasses} {...rest}>
      {children}
    </Link>
  );
}
