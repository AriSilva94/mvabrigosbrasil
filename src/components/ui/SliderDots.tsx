import type { ReactElement } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SliderDotsProps = {
  total: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
};

const DOT_BASE_CLASS = "h-1.5 rounded-full transition-all";
const DOT_ACTIVE_CLASS = "w-6 bg-brand-accent";
const DOT_INACTIVE_CLASS = "w-3 bg-slate-300";

export default function SliderDots({
  total,
  activeIndex,
  onSelect,
}: SliderDotsProps): ReactElement {
  const isInteractive = typeof onSelect === "function";

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, idx) => {
        const className = twMerge(
          clsx(
            DOT_BASE_CLASS,
            idx === activeIndex ? DOT_ACTIVE_CLASS : DOT_INACTIVE_CLASS
          )
        );
        const handleSelect = onSelect ? () => onSelect(idx) : undefined;

        return (
          <span
            key={idx}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={`Slide ${idx + 1}`}
            aria-pressed={isInteractive ? idx === activeIndex : undefined}
            className={twMerge(
              className,
              isInteractive
                ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                : "cursor-default"
            )}
            onClick={isInteractive ? handleSelect : undefined}
            onKeyDown={
              isInteractive
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelect?.();
                    }
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
