import { useState, useEffect, useCallback } from "react";
import type { ShelterHistoryRecord, ShelterHistoryItem } from "@/types/shelter.types";

interface UseShelterHistoryReturn {
  history: ShelterHistoryItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const FIELD_LABELS: Record<string, string> = {
  shelter_type: "Tipo de Abrigo",
  cnpj: "CNPJ/CPF",
  name: "Nome do Abrigo",
  cep: "CEP",
  street: "Rua",
  number: "Número",
  district: "Bairro",
  state: "Estado",
  city: "Cidade",
  website: "Website",
  foundation_date: "Data de Fundação",
  species: "Espécie Principal",
  additional_species: "Espécies Adicionais",
  temporary_agreement: "Termo de Guarda Temporária",
  initial_dogs: "População Inicial de Cães",
  initial_cats: "População Inicial de Gatos",
  authorized_name: "Nome do Responsável",
  authorized_role: "Cargo",
  authorized_email: "E-mail",
  authorized_phone: "Telefone",
  active: "Status",
};

function mapHistoryRecord(record: ShelterHistoryRecord): ShelterHistoryItem {
  return {
    id: record.id,
    operation: record.operation,
    changedFields: record.changed_fields.map((field) => FIELD_LABELS[field] || field),
    changedAt: record.changed_at,
    oldValues: record.old_data || undefined,
    newValues: record.new_data || undefined,
  };
}

export function useShelterHistory(): UseShelterHistoryReturn {
  const [history, setHistory] = useState<ShelterHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchHistory = useCallback(
    async (resetOffset = false) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentOffset = resetOffset ? 0 : offset;
        const response = await fetch(
          `/api/shelter-profile/history?limit=${limit}&offset=${currentOffset}`,
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar histórico");
        }

        const data = await response.json();

        const mappedHistory = (data.history || []).map(mapHistoryRecord);

        if (resetOffset) {
          setHistory(mappedHistory);
          setOffset(limit);
        } else {
          setHistory((prev) => [...prev, ...mappedHistory]);
          setOffset((prev) => prev + limit);
        }

        setTotal(data.total || 0);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar histórico";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [offset],
  );

  const loadMore = useCallback(async () => {
    if (isLoading || history.length >= total) return;
    await fetchHistory(false);
  }, [isLoading, history.length, total, fetchHistory]);

  const refresh = useCallback(async () => {
    await fetchHistory(true);
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    history,
    isLoading,
    error,
    total,
    hasMore: history.length < total,
    loadMore,
    refresh,
  };
}
