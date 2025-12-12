import type { JSX } from "react";
import clsx from "clsx";

type SkeletonChartProps = {
  className?: string;
  height?: "sm" | "md" | "lg" | "xl";
};

export default function SkeletonChart({
  className,
  height = "md",
}: SkeletonChartProps): JSX.Element {
  const heightClass = {
    sm: "h-48",
    md: "h-64",
    lg: "h-80",
    xl: "h-96",
  }[height];

  return (
    <div
      className={clsx(
        "animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        className
      )}
      aria-label="Carregando gráfico..."
      role="status"
    >
      {/* Title skeleton */}
      <div className="mb-4 h-6 w-1/3 rounded bg-slate-200" />

      {/* Chart area skeleton */}
      <div className={clsx("rounded-lg bg-slate-100", heightClass)}>
        <div className="flex h-full items-end justify-around gap-2 p-4">
          {/* Simulated bars */}
          {[60, 80, 45, 90, 70, 55, 85, 40, 75, 65].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-slate-200"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <div className="h-4 w-20 rounded bg-slate-200" />
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-4 w-16 rounded bg-slate-200" />
      </div>
    </div>
  );
}
