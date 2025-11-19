import type { ReactElement } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SliderDotsProps = {
  total: number;
  activeIndex: number;
};

const DOT_BASE_CLASS = "h-1.5 rounded-full transition-all";
const DOT_ACTIVE_CLASS = "w-6 bg-brand-accent";
const DOT_INACTIVE_CLASS = "w-3 bg-slate-300";

export default function SliderDots({
  total,
  activeIndex,
}: SliderDotsProps): ReactElement {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, idx) => {
        const className = twMerge(
          clsx(
            DOT_BASE_CLASS,
            idx === activeIndex ? DOT_ACTIVE_CLASS : DOT_INACTIVE_CLASS
          )
        );

        return (
          <span
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            className={className}
          />
        );
      })}
    </div>
  );
}
