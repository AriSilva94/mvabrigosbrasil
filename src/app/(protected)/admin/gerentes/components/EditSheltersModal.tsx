"use client";

import { useState, useEffect, useMemo } from "react";
import type { JSX } from "react";
import { X, Building2, Check, Search } from "lucide-react";

type Manager = {
  id: string;
  email: string | null;
  shelters: Array<{
    id: string;
    name: string;
    wp_post_id: number;
  }>;
};

type Shelter = {
  id: string;
  name: string;
  wp_post_id: number;
};

type EditSheltersModalProps = {
  manager: Manager;
  onClose: () => void;
  onSave: () => void;
};

export default function EditSheltersModal({ manager, onClose, onSave }: EditSheltersModalProps): JSX.Element {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar IDs selecionados
    setSelectedIds(manager.shelters.map(s => s.id));

    // Buscar todos os abrigos
    async function fetchShelters() {
      try {
        const response = await fetch("/api/shelters");
        if (!response.ok) {
          throw new Error("Erro ao carregar abrigos");
        }
        const data = await response.json();
        setShelters(data.shelters || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchShelters();
  }, [manager]);

  // Filtrar abrigos pela busca
  const filteredShelters = useMemo(() => {
    if (!searchTerm.trim()) return shelters;

    const search = searchTerm.toLowerCase();
    return shelters.filter(shelter =>
      shelter.name.toLowerCase().includes(search) ||
      shelter.wp_post_id.toString().includes(search)
    );
  }, [shelters, searchTerm]);

  const toggleShelter = (shelterId: string) => {
    setSelectedIds(prev =>
      prev.includes(shelterId)
        ? prev.filter(id => id !== shelterId)
        : [...prev, shelterId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      console.log("Salvando vínculos:", {
        managerId: manager.id,
        selectedIds,
        count: selectedIds.length
      });

      const response = await fetch(`/api/admin/managers/${manager.id}/shelters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelter_ids: selectedIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar vínculos");
      }

      console.log("Vínculos salvos com sucesso");

      // Chamar callback de sucesso
      onSave();

      // Fechar modal
      onClose();
    } catch (err) {
      console.error("Erro ao salvar vínculos:", err);
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Editar Vínculos de Abrigos
            </h2>
            <p className="mt-1 text-sm text-slate-600">{manager.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#7b8191]">Carregando abrigos disponíveis…</p>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
              {error}
            </div>
          ) : shelters.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Nenhum abrigo disponível
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Selecione os abrigos que este gerente pode gerenciar:
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {selectedIds.length} abrigo(s) selecionado(s)
                </p>
              </div>

              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar abrigo por nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="space-y-2">
                {filteredShelters.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm text-slate-600">
                      Nenhum abrigo encontrado com &quot;{searchTerm}&quot;
                    </p>
                  </div>
                ) : (
                  filteredShelters.map((shelter) => {
                  const isSelected = selectedIds.includes(shelter.id);
                  return (
                    <label
                      key={shelter.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/5"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{shelter.name}</p>
                        <p className="text-xs text-slate-500">ID: {shelter.wp_post_id}</p>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleShelter(shelter.id)}
                        className="sr-only"
                      />
                    </label>
                  );
                })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
