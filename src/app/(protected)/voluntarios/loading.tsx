import type { JSX } from "react";
import VolunteerCardSkeleton from "@/components/loading/VolunteerCardSkeleton";
import SkeletonButton from "@/components/loading/SkeletonButton";

export default function Loading(): JSX.Element {
  return (
    <section className="bg-white">
      <div className="container px-6 py-12">
        <div className="space-y-6">
          {/* Filters */}
          <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-11 rounded-lg bg-slate-100" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-11 rounded-lg bg-slate-100" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-11 rounded-lg bg-slate-100" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <SkeletonButton size="sm" variant="secondary" />
              <SkeletonButton size="sm" variant="primary" />
            </div>
          </div>

          {/* Status banner */}
          <div className="animate-pulse rounded-xl border border-[#cbe7d8] bg-[#e5f3ec] px-4 py-3 text-center">
            <div className="mx-auto h-5 w-48 rounded bg-[#a8d4bf]" />
          </div>

          {/* Volunteer cards grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <VolunteerCardSkeleton />
            <VolunteerCardSkeleton />
            <VolunteerCardSkeleton />
            <VolunteerCardSkeleton />
            <VolunteerCardSkeleton />
            <VolunteerCardSkeleton />
          </div>
        </div>
      </div>
    </section>
  );
}
