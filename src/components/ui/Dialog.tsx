"use client";

import type { HTMLAttributes, PropsWithChildren } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

type DialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>,
    document.body,
  );
}

type DialogContentProps = HTMLAttributes<HTMLDivElement>;

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={clsx(
        "mx-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <div className={clsx("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  return (
    <h2
      className={clsx("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
}
