import type { JSX } from "react";
import SkeletonCard from "@/components/loading/SkeletonCard";
import SkeletonText from "@/components/loading/SkeletonText";

export default function Loading(): JSX.Element {
  return (
    <section className="bg-white py-12">
      <div className="container px-6">
        <div className="space-y-6">
          {/* Search/Filter bar */}
          <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="h-11 flex-1 rounded-lg bg-slate-100" />
              <div className="h-11 w-full rounded-lg bg-slate-100 md:w-40" />
            </div>
          </div>

          {/* Article cards list */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SkeletonCard key={item} className="flex gap-4 p-6">
                {/* Optional image */}
                <div className="hidden h-32 w-48 shrink-0 rounded-lg bg-slate-200 md:block" />

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Title */}
                  <div className="h-6 w-3/4 rounded bg-slate-200" />

                  {/* Description */}
                  <SkeletonText lines={3} />

                  {/* Meta info (date, author, category) */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex justify-center gap-2 pt-6">
            {[1, 2, 3, 4, 5].map((page) => (
              <div
                key={page}
                className="h-10 w-10 animate-pulse rounded bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
