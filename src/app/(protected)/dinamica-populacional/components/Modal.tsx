import type { JSX, ReactNode } from "react";
import { Heading } from "@/components/ui/typography";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  title,
  isOpen,
  onClose,
  children,
}: ModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <Heading as="h2" className="text-lg font-semibold text-slate-800">
            {title}
          </Heading>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
