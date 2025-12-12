import type { JSX } from "react";
import clsx from "clsx";

type SkeletonInputProps = {
  className?: string;
  label?: boolean;
  type?: "text" | "select" | "textarea";
};

export default function SkeletonInput({
  className,
  label = true,
  type = "text",
}: SkeletonInputProps): JSX.Element {
  return (
    <div className={clsx("space-y-2", className)}>
      {label && <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />}

      {type === "textarea" ? (
        <div className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
      ) : type === "select" ? (
        <div className="h-11 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
      ) : (
        <div className="h-11 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
      )}
    </div>
  );
}
