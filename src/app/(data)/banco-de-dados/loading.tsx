import type { JSX } from "react";
import MetricCardSkeleton from "@/components/loading/MetricCardSkeleton";
import SkeletonChart from "@/components/loading/SkeletonChart";
import SkeletonButton from "@/components/loading/SkeletonButton";
import SkeletonText from "@/components/loading/SkeletonText";

export default function Loading(): JSX.Element {
  return (
    <section className="bg-white pb-16 pt-12">
      <div className="container min-w-0 space-y-10 px-6">
        {/* Filters and description panel */}
        <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <SkeletonText lines={3} />

            {/* Filters */}
            <div className="flex w-full flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:flex-wrap">
              <div className="flex w-full flex-col gap-2 sm:min-w-[200px]">
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-[46px] w-full rounded-lg bg-slate-100" />
              </div>

              <div className="flex w-full flex-col gap-2 sm:min-w-60">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-[46px] w-full rounded-lg bg-slate-100" />
              </div>

              <SkeletonButton className="h-[46px] w-full sm:w-auto" />
            </div>
          </div>

          {/* Metrics grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        </div>

        {/* Main chart - Animal Flow */}
        <SkeletonChart height="lg" />

        {/* Section header - Entradas */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Monthly entries chart */}
        <SkeletonChart height="md" />

        {/* Two charts side by side */}
        <div className="grid min-w-0 gap-4 lg:grid-cols-2 *:min-w-0">
          <SkeletonChart height="md" />
          <SkeletonChart height="md" />
        </div>

        {/* Section header - Saídas */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Species exits chart */}
        <SkeletonChart height="md" />

        {/* Two outcomes charts side by side */}
        <div className="grid min-w-0 gap-4 lg:grid-cols-2 *:min-w-0">
          <SkeletonChart height="md" />
          <SkeletonChart height="md" />
        </div>

        {/* Adoptions by type chart */}
        <SkeletonChart height="md" />
      </div>
    </section>
  );
}
