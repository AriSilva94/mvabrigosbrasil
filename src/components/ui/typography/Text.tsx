import type { HTMLAttributes } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type TextProps = HTMLAttributes<HTMLParagraphElement>;

const BASE_CLASS = "text-base";

export default function Text({ className, children, ...rest }: TextProps) {
  const mergedClassName = twMerge(clsx(BASE_CLASS, className));

  return (
    <p className={mergedClassName} {...rest}>
      {children}
    </p>
  );
}
