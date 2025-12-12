import type { JSX } from "react";
import FormSkeleton from "@/components/loading/FormSkeleton";

export default function Loading(): JSX.Element {
  return (
    <section className="bg-white px-4 py-14 md:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <FormSkeleton />

        {/* Optional: Shelter history timeline skeleton */}
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 h-6 w-40 rounded bg-slate-200" />

          <div className="space-y-6">
            {/* Timeline items */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-slate-200" />
                  {item < 3 && <div className="h-full w-0.5 bg-slate-200" />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pb-6">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
