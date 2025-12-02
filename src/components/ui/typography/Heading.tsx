import type { HTMLAttributes } from "react";
import clsx from "clsx";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel;
};

const BASE_CLASS = "font-600 leading-tight";

export default function Heading({
  as = "h2",
  className,
  children,
  ...rest
}: HeadingProps) {
  const Component = as;
  const mergedClassName = clsx(BASE_CLASS, className);

  return (
    <Component className={mergedClassName} {...rest}>
      {children}
    </Component>
  );
}
