import type { JSX } from "react";
import clsx from "clsx";

type SkeletonButtonProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
};

export default function SkeletonButton({
  className,
  size = "md",
  variant = "primary",
}: SkeletonButtonProps): JSX.Element {
  const sizeClass = {
    sm: "h-8 w-24",
    md: "h-10 w-32",
    lg: "h-12 w-40",
  }[size];

  const variantClass =
    variant === "primary"
      ? "bg-slate-300"
      : "bg-slate-200 border border-slate-300";

  return (
    <div
      className={clsx(
        "animate-pulse rounded-full",
        sizeClass,
        variantClass,
        className
      )}
      aria-label="Carregando botão..."
      role="status"
    />
  );
}
