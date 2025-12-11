"use client";

import { useShelterHistory } from "@/hooks/useShelterHistory";
import { Heading } from "@/components/ui/typography";
import { FileEdit, FilePlus, FileX, ToggleLeft, Loader2, AlertCircle } from "lucide-react";
import type { ShelterHistoryOperation } from "@/types/shelter.types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const OPERATION_CONFIG: Record<
  ShelterHistoryOperation,
  {
    icon: typeof FilePlus;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  INSERT: {
    icon: FilePlus,
    label: "Cadastro Criado",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  UPDATE: {
    icon: FileEdit,
    label: "Cadastro Atualizado",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  STATUS_CHANGE: {
    icon: ToggleLeft,
    label: "Status Alterado",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  DELETE: {
    icon: FileX,
    label: "Cadastro Removido",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

export function ShelterHistoryTimeline() {
  const { history, isLoading, error, hasMore, loadMore } = useShelterHistory();

  if (isLoading && history.length === 0) {
    return (
      <section className="rounded-2xl bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10">
        <Heading as="h2" className="mb-6 text-xl font-semibold text-brand-primary">
          Histórico de Alterações
        </Heading>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10">
        <Heading as="h2" className="mb-6 text-xl font-semibold text-brand-primary">
          Histórico de Alterações
        </Heading>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (history.length === 0) {
    return (
      <section className="rounded-2xl bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10">
        <Heading as="h2" className="mb-6 text-xl font-semibold text-brand-primary">
          Histórico de Alterações
        </Heading>
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma alteração registrada ainda.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10">
      <Heading as="h2" className="mb-6 text-xl font-semibold text-brand-primary">
        Histórico de Alterações
      </Heading>

      <div className="relative space-y-6">
        {/* Linha vertical da timeline */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200" />

        {history.map((item) => {
          const config = OPERATION_CONFIG[item.operation];
          const Icon = config.icon;

          return (
            <div key={item.id} className="relative flex gap-4">
              {/* Ícone */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(item.changedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                {/* Campos alterados */}
                {(item.changes?.length ?? item.changedFields.length) > 0 && (
                  <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-medium text-gray-700">Campos alterados:</p>
                    <ul className="space-y-3">
                      {item.changes?.length ? (
                        item.changes.map((change) => (
                          <li key={change.field} className="text-sm text-gray-700">
                            <div className="font-semibold text-gray-900">{change.label}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <span className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] leading-tight text-gray-700">
                                De: {change.from}
                              </span>
                              <span className="text-gray-400">-&gt;</span>
                              <span className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] leading-tight text-gray-900">
                                Para: {change.to}
                              </span>
                            </div>
                          </li>
                        ))
                      ) : (
                        item.changedFields.map((field, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            • {field}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão "Carregar mais" */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar mais"
            )}
          </button>
        </div>
      )}
    </section>
  );
}
