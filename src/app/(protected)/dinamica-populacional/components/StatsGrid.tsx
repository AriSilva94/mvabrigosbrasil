import type { JSX } from "react";
import { ArrowDownRight, ArrowUpRight, MinusCircle } from "lucide-react";

import type { RateCardData } from "../types";

type StatsGridProps = {
  id?: string;
  stats: RateCardData[];
};

const trendStyles: Record<
  RateCardData["trend"],
  { icon: typeof ArrowUpRight; color: string; bg: string }
> = {
  up: {
    icon: ArrowUpRight,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  down: {
    icon: ArrowDownRight,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  neutral: {
    icon: MinusCircle,
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
};

const formatPercent = (value: number | null): string =>
  typeof value === "number" ? `${value.toFixed(2)}%` : "—";

export default function StatsGrid({ id, stats }: StatsGridProps): JSX.Element {
  return (
    <div id={id} className="grid gap-3 lg:grid-cols-3">
      {stats.map((stat) => {
        const style = trendStyles[stat.trend];
        const Icon = style.icon;
        return (
          <div
            key={stat.key}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-800">
                {stat.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${style.bg} ${style.color}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {formatPercent(stat.value)}
              </span>
            </div>
            {stat.helperText ? (
              <p className="text-xs text-slate-600">{stat.helperText}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
