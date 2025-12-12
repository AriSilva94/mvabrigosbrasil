import type { JSX } from "react";
import SkeletonCard from "./SkeletonCard";

export default function VolunteerCardSkeleton(): JSX.Element {
  return (
    <SkeletonCard className="flex gap-4 p-5">
      {/* Avatar */}
      <div className="h-16 w-16 shrink-0 rounded-full bg-slate-200" />

      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Name */}
        <div className="h-5 w-3/4 rounded bg-slate-200" />

        {/* Info lines */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 rounded-full bg-slate-200" />
          <div className="h-6 w-24 rounded-full bg-slate-200" />
          <div className="h-6 w-16 rounded-full bg-slate-200" />
        </div>
      </div>
    </SkeletonCard>
  );
}
