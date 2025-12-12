import type { JSX } from "react";
import SkeletonCard from "./SkeletonCard";

export default function MetricCardSkeleton(): JSX.Element {
  return (
    <SkeletonCard className="flex flex-col items-center justify-center p-4">
      {/* Icon */}
      <div className="h-12 w-12 rounded-full bg-slate-200" />

      {/* Value */}
      <div className="mt-3 h-8 w-20 rounded bg-slate-200" />

      {/* Label */}
      <div className="mt-2 h-4 w-24 rounded bg-slate-200" />

      {/* Progress bar */}
      <div className="mt-2 h-2 w-full max-w-[140px] rounded-full bg-slate-200" />
    </SkeletonCard>
  );
}
