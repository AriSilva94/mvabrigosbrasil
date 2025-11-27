import type { ComponentPropsWithoutRef, ElementType, JSX } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type PawsBackgroundSectionProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export default function PawsBackgroundSection<
  T extends ElementType = "section",
>({
  as,
  className,
  style,
  children,
  ...rest
}: PawsBackgroundSectionProps<T>): JSX.Element {
  const Component = as ?? "section";
  const mergedClassName = twMerge(
    clsx("bg-brand-primary text-white", className)
  );

  return (
    <Component
      className={mergedClassName}
      style={{
        backgroundImage: "url('/assets/img/bg_paws.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "inherit",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
