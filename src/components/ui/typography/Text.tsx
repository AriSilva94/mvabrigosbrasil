import type { HTMLAttributes } from "react";
import clsx from "clsx";

type TextProps = HTMLAttributes<HTMLParagraphElement>;

const BASE_CLASS = "text-base";

export default function Text({ className, children, ...rest }: TextProps) {
  const mergedClassName = clsx(BASE_CLASS, className);

  return (
    <p className={mergedClassName} {...rest}>
      {children}
    </p>
  );
}
