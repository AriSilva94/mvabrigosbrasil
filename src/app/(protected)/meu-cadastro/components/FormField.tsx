import type { JSX } from "react";
import clsx from "clsx";

import type { ShelterFieldProps } from "@/types/shelter.types";

export function FormField({
  id,
  label,
  required,
  hint,
  children,
}: ShelterFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-start gap-1 text-sm font-semibold text-[#4f5464]"
      >
        <span>
          {label}
          {required && <span className="text-brand-red"> *</span>}
        </span>
        {hint && (
          <span className="text-xs font-normal text-[#9ba1ad]">({hint})</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function InlineField({
  id,
  label,
  required,
  hint,
  children,
}: ShelterFieldProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={clsx(
          "text-sm font-semibold text-[#4f5464]",
          hint && "flex items-start gap-1"
        )}
      >
        <span>
          {label}
          {required && <span className="text-brand-red"> *</span>}
        </span>
        {hint && (
          <span className="text-xs font-normal text-[#9ba1ad]">({hint})</span>
        )}
      </label>
      {children}
    </div>
  );
}
