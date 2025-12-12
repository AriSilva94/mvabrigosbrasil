import type { JSX } from "react";
import SkeletonCard from "./SkeletonCard";
import SkeletonInput from "./SkeletonInput";
import SkeletonButton from "./SkeletonButton";

export default function FormSkeleton(): JSX.Element {
  return (
    <SkeletonCard className="space-y-6 p-8">
      {/* Title */}
      <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />

      {/* Form fields - 2 columns */}
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonInput type="select" />
        <SkeletonInput type="select" />
        <SkeletonInput />
        <SkeletonInput />
      </div>

      {/* Full width field */}
      <SkeletonInput type="textarea" />

      {/* Action buttons */}
      <div className="flex justify-center gap-3 pt-4">
        <SkeletonButton size="lg" variant="primary" />
        <SkeletonButton size="lg" variant="secondary" />
      </div>
    </SkeletonCard>
  );
}
