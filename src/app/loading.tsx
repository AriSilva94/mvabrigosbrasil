import type { JSX } from "react";
import { PawPrint, Bone, Cat } from "lucide-react";

const cards = [
  { id: "dogs", title: "Cães felizes", icon: Bone },
  { id: "cats", title: "Gatos curiosos", icon: Cat },
  { id: "volunteers", title: "Voluntários prontos", icon: PawPrint },
];

export default function Loading(): JSX.Element {
  return (
    <main className="max-h-3/6 bg-linear-to-b from-[#f7f9fb] via-[#eef5ff] to-white">
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-16">
        <div className="absolute -left-10 top-10 hidden h-16 w-16 rotate-6 rounded-full bg-white/60 shadow-xl blur-sm md:block" />
        <div className="absolute -right-14 bottom-10 hidden h-24 w-24 -rotate-3 rounded-full bg-white/60 shadow-xl blur md:block" />

        <div className="mb-8 flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#2f3b52] shadow-lg ring-1 ring-slate-100">
          <PawPrint
            className="h-4 w-4 text-brand-primary animate-pulse"
            aria-hidden
          />
          Carregando a matilha e a turma dos felinos...
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 text-brand-primary">
            <PawPrint className="h-8 w-8 animate-bounce" aria-hidden />
            <Bone className="h-8 w-8 animate-bounce delay-150" aria-hidden />
            <Cat className="h-8 w-8 animate-bounce delay-300" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2f3b52]">
            Preparando sua página
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#536079]">
            Buscando seus dados, verificando seu perfil e deixando tudo pronto
            para você ajudar cães e gatos.
          </p>
        </div>

        <div className="mt-10 grid w-full gap-5 md:grid-cols-3">
          {cards.map(({ id, title, icon: Icon }) => (
            <div
              key={id}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-8 shadow-[0_10px_35px_rgba(16,130,89,0.08)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                <Icon
                  className="h-6 w-6 animate-spin"
                  style={{ animationDuration: "1.6s" }}
                  aria-hidden
                />
              </div>
              <p className="mt-3 text-base font-semibold text-[#2f3b52]">
                {title}
              </p>
              <div className="mt-2 h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-primary/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
