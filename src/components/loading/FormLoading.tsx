"use client";

import type { JSX } from "react";
import { Bone, Cat, PawPrint } from "lucide-react";

const cards = [
  { id: "dogs", title: "Cães felizes", icon: Bone },
  { id: "cats", title: "Gatos curiosos", icon: Cat },
  { id: "volunteers", title: "Voluntários prontos", icon: PawPrint },
];

/**
 * Reutilizável para cenários de carregamento client-side que precisam
 * substituir o conteúdo principal por um placeholder no estilo do loading global.
 */
export function FormLoading(): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl rounded-2xl bg-white px-6 py-10 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-[#2f3b52]">
          <PawPrint className="h-4 w-4 animate-pulse text-brand-primary" aria-hidden />
          Carregando seu cadastro...
        </div>
        <div className="flex items-center gap-3 text-brand-primary">
          <PawPrint className="h-7 w-7 animate-bounce" aria-hidden />
          <Bone className="h-7 w-7 animate-bounce delay-150" aria-hidden />
          <Cat className="h-7 w-7 animate-bounce delay-300" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[#2f3b52]">Preparando seu abrigo</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#536079]">
          Buscando suas informações para preencher o formulário automaticamente.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map(({ id, title, icon: Icon }) => (
          <div
            key={id}
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 shadow-[0_10px_35px_rgba(16,130,89,0.06)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Icon className="h-5 w-5 animate-spin" style={{ animationDuration: "1.4s" }} aria-hidden />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#2f3b52]">{title}</p>
            <div className="mt-2 h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-primary/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
