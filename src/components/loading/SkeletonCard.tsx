import type { JSX } from "react";
import clsx from "clsx";

type SkeletonCardProps = {
  className?: string;
  children?: React.ReactNode;
};

export default function SkeletonCard({
  className,
  children,
}: SkeletonCardProps): JSX.Element {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        className
      )}
      aria-label="Carregando..."
      role="status"
    >
      {children}
    </div>
  );
}
