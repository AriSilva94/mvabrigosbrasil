import type { JSX } from "react";
import clsx from "clsx";

type SkeletonTextProps = {
  className?: string;
  lines?: number;
  width?: "full" | "3/4" | "1/2" | "1/4";
};

export default function SkeletonText({
  className,
  lines = 1,
  width = "full",
}: SkeletonTextProps): JSX.Element {
  const widthClass = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/4": "w-1/4",
  }[width];

  return (
    <div className={clsx("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            "h-4 rounded bg-slate-200 animate-pulse",
            index === lines - 1 && lines > 1 ? "w-3/4" : widthClass
          )}
        />
      ))}
    </div>
  );
}
