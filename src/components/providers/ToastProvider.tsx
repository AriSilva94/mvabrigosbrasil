// Global toast provider for client components
"use client";

import type { JSX, ReactNode } from "react";
import { Toaster } from "sonner";

type ToastProviderProps = {
  children?: ReactNode;
};

export default function ToastProvider({
  children,
}: ToastProviderProps): JSX.Element {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
