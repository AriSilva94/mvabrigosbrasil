import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "outline" | "destructive" | "default";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children?: ReactNode;
};

const baseClass =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary/40",
  outline:
    "border border-slate-300 text-[#6b7280] hover:bg-slate-50 focus:ring-slate-300",
  destructive:
    "bg-brand-red text-white hover:bg-brand-red/90 focus:ring-brand-red/40",
  default:
    "bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary/40",
};

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = clsx(baseClass, variantClasses[variant], className);
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
