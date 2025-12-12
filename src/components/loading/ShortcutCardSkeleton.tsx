import type { JSX } from "react";
import SkeletonCard from "./SkeletonCard";

export default function ShortcutCardSkeleton(): JSX.Element {
  return (
    <SkeletonCard className="flex flex-col items-center justify-center p-10 text-center">
      {/* Icon */}
      <div className="h-12 w-12 rounded-full bg-slate-200" />

      {/* Title */}
      <div className="mt-4 h-6 w-32 rounded bg-slate-200" />

      {/* Subtitle (optional) */}
      <div className="mt-2 h-4 w-40 rounded bg-slate-200" />
    </SkeletonCard>
  );
}
