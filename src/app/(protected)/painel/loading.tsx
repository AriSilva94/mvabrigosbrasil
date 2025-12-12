import type { JSX } from "react";
import ShortcutCardSkeleton from "@/components/loading/ShortcutCardSkeleton";

export default function Loading(): JSX.Element {
  return (
    <section className="bg-white">
      <div className="container px-6 py-14">
        {/* Alert banner skeleton */}
        <div className="animate-pulse rounded-xl border border-[#f2e5b9] bg-[#fff7d5] px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="h-5 w-64 rounded bg-[#e8d99f]" />
            </div>
            <div className="h-10 w-full rounded-lg bg-[#e8d99f] md:w-48" />
          </div>
        </div>

        {/* Shortcuts grid */}
        <section className="mt-10">
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <li>
              <ShortcutCardSkeleton />
            </li>
            <li>
              <ShortcutCardSkeleton />
            </li>
            <li>
              <ShortcutCardSkeleton />
            </li>
            <li>
              <ShortcutCardSkeleton />
            </li>
            <li>
              <ShortcutCardSkeleton />
            </li>
            <li>
              <ShortcutCardSkeleton />
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
}
