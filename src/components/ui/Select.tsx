import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
