"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { UserCog, Building2, PawPrint } from "lucide-react";

import { Heading, Text } from "@/components/ui/typography";

type Manager = {
  id: string;
  email: string | null;
  wp_user_id: number | null;
  created_at: string;
  shelters: Array<{
    id: string;
    name: string;
    wp_post_id: number;
  }>;
};

type ManagersListProps = {
  onEdit: (manager: Manager) => void;
};

export default function ManagersList({ onEdit }: ManagersListProps): JSX.Element {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchManagers() {
      try {
        const response = await fetch("/api/admin/managers");
        if (!response.ok) {
          throw new Error("Erro ao carregar gerentes");
        }
        const data = await response.json();
        setManagers(data.managers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchManagers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(16,130,89,0.06)] md:px-6">
        <div className="flex items-center justify-between">
          <Heading as="h3" className="text-lg font-semibold text-brand-secondary">
            Gerentes cadastrados
          </Heading>
          <div className="flex items-center gap-2 text-brand-primary">
            <PawPrint className="h-4 w-4 animate-pulse" aria-hidden />
            <span className="text-sm font-medium text-[#7b8191]">Carregando…</span>
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(16,130,89,0.06)] md:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (managers.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(16,130,89,0.06)] md:px-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <UserCog className="mx-auto h-12 w-12 text-slate-400" />
          <Text className="mt-4 font-semibold text-slate-700">
            Nenhum gerente cadastrado
          </Text>
          <Text className="mt-1 text-sm text-slate-600">
            Quando houver gerentes no sistema, eles aparecerão aqui.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(16,130,89,0.06)] md:px-6">
      <div className="flex items-center justify-between">
        <Heading as="h3" className="text-lg font-semibold text-brand-secondary">
          {managers.length} gerente{managers.length !== 1 ? "s" : ""} cadastrado{managers.length !== 1 ? "s" : ""}
        </Heading>
      </div>

      <ul className="divide-y divide-slate-100">
        {managers.map((manager) => (
          <li key={manager.id} className="py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 shrink-0 text-brand-primary" />
                  <Text className="break-all font-semibold text-[#4f5464]">
                    {manager.email ?? "E-mail não informado"}
                  </Text>
                </div>

                <Text className="mt-1 text-xs text-[#7b8191]">
                  Cadastrado em: {new Date(manager.created_at).toLocaleDateString("pt-BR")}
                </Text>

                {manager.shelters.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {manager.shelters.map((shelter) => (
                      <span
                        key={shelter.id}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
                      >
                        <Building2 className="h-3 w-3" />
                        {shelter.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Text className="mt-2 text-xs text-[#7b8191]">
                    Nenhum abrigo vinculado
                  </Text>
                )}
              </div>

              <div className="mt-2 md:mt-0">
                <button
                  type="button"
                  onClick={() => onEdit(manager)}
                  className="inline-flex items-center rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/5"
                >
                  Editar Vínculos
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
