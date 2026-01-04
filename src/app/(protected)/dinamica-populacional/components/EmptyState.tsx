import type { JSX } from "react";

type EmptyStateProps = {
  onOpenRegister: () => void;
  isReadOnly?: boolean;
};

export default function EmptyState({
  onOpenRegister,
  isReadOnly = false,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-800">
        {isReadOnly ? "Nenhum registro disponível." : "Você ainda não possui nenhum registro."}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {isReadOnly
          ? "Este abrigo ainda não possui dados de dinâmica populacional registrados."
          : "Clique para cadastrar seu primeiro mês de dados."}
      </p>
      {!isReadOnly && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenRegister}
            className="rounded-lg bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-secondary cursor-pointer"
          >
            Novo Registro
          </button>
        </div>
      )}
    </div>
  );
}
