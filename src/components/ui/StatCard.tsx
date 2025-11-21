import type { ReactElement } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import type { MapStatistic, MapStatisticVariant } from "@/types/home.types";

type StatCardProps = MapStatistic;

const VALUE_BASE_CLASS = "font-600 font-45 leading-none";
const LABEL_BASE_CLASS = "font-20 font-600";

const VARIANT_CLASSES: Record<MapStatisticVariant, { value: string; label: string }> = {
  primary: { value: " color-primary", label: " color-primary" },
  secondary: { value: " text-color-secondary", label: " text-color-secondary" },
};

export default function StatCard({
  value,
  label,
  variant = "secondary",
}: StatCardProps): ReactElement {
  const variantClass = VARIANT_CLASSES[variant];

  const valueClassName = twMerge(clsx(VALUE_BASE_CLASS, variantClass.value));
  const labelClassName = twMerge(clsx(LABEL_BASE_CLASS, variantClass.label));

  return (
    <div className="text-center">
      <h3 className={valueClassName}>{value}</h3>
      <span className={labelClassName}>{label}</span>
    </div>
  );
}
