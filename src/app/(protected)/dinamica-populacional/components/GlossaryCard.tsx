import type { JSX } from "react";

type GlossaryCardProps = {
  onOpenGlossary: () => void;
};

export default function GlossaryCard({
  onOpenGlossary,
}: GlossaryCardProps): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-base text-slate-700">
          Algum termo não ficou claro? Acesse nosso glossário para entender melhor.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onOpenGlossary}
            className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-secondary cursor-pointer"
          >
            Visualizar Glossário
          </button>
        </div>
      </div>
    </div>
  );
}
