import type { ButtonHTMLAttributes, ReactElement } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SliderNavButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

const BASE_CLASS =
  "rounded-full border border-slate-300 px-3 py-2 text-brand-primary transition hover:border-brand-primary";

export default function SliderNavButton({
  label,
  className,
  children,
  ...rest
}: SliderNavButtonProps): ReactElement {
  const mergedClassName = twMerge(clsx(BASE_CLASS, className));

  return (
    <button type="button" aria-label={label} className={mergedClassName} {...rest}>
      {children}
    </button>
  );
}
