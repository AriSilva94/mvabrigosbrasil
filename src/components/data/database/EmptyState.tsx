import { Database, FileQuestion, AlertCircle } from "lucide-react";

type EmptyStateProps = {
  yearLabel: string;
  stateLabel: string;
};

export default function EmptyState({ yearLabel, stateLabel }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Database size={40} className="text-slate-400" strokeWidth={1.5} />
        </div>

        <h3 className="mb-3 text-xl font-semibold text-slate-900">
          Nenhum dado disponível
        </h3>

        <div className="mb-6 max-w-md space-y-2">
          <p className="text-sm text-slate-600">
            Não foram encontrados dados de abrigos para os filtros selecionados:
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
            <span className="rounded-md bg-slate-100 px-3 py-1.5">
              {yearLabel}
            </span>
            <span className="text-slate-400">•</span>
            <span className="rounded-md bg-slate-100 px-3 py-1.5">
              {stateLabel}
            </span>
          </div>
        </div>

        <div className="w-full max-w-lg space-y-4 rounded-lg bg-blue-50 border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 flex-shrink-0 text-blue-600"
            />
            <div className="text-left space-y-2">
              <h4 className="font-semibold text-blue-900">
                O que você pode fazer:
              </h4>
              <ul className="space-y-1.5 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-600" />
                  <span>
                    Tente selecionar um <strong>ano diferente</strong> usando o
                    filtro acima
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-600" />
                  <span>
                    Selecione <strong>Todos</strong> no filtro de estados para ver
                    dados nacionais
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-600" />
                  <span>
                    Verifique se há dados disponíveis para este estado em outros
                    anos
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <FileQuestion size={14} />
          <span>
            Os dados são atualizados mensalmente pelos abrigos cadastrados
          </span>
        </div>
      </div>
    </div>
  );
}
