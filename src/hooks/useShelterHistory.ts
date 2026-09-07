import { useState, useEffect, useCallback, useRef } from "react";
import { getShelterHistory } from "@/modules/shelter/shelterProfileApi";
import {
  isCurrentShelterHistoryRequest,
  shelterHistoryErrorMessage,
} from "@/modules/shelter/shelterHistoryError";
import type { ShelterHistoryItem } from "@/types/shelter.types";

interface UseShelterHistoryReturn {
  history: ShelterHistoryItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const HISTORY_LIMIT = 20;

export function useShelterHistory(): UseShelterHistoryReturn {
  const [history, setHistory] = useState<ShelterHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const offsetRef = useRef(0);
  const requestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchHistory = useCallback(
    async (resetOffset = false) => {
      const requestId = ++requestRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const currentOffset = resetOffset ? 0 : offsetRef.current;
        const data = await getShelterHistory(
          HISTORY_LIMIT,
          currentOffset,
          controller.signal,
        );
        if (!isCurrentShelterHistoryRequest(requestId, requestRef.current)) {
          return;
        }

        if (resetOffset) {
          setHistory(data.history);
          offsetRef.current = HISTORY_LIMIT;
        } else {
          setHistory((prev) => [...prev, ...data.history]);
          offsetRef.current += HISTORY_LIMIT;
        }

        setTotal(data.total);
      } catch (error) {
        if (
          !controller.signal.aborted &&
          isCurrentShelterHistoryRequest(requestId, requestRef.current)
        ) {
          const message = shelterHistoryErrorMessage(error);
          if (message !== null) setError(message);
        }
      } finally {
        if (isCurrentShelterHistoryRequest(requestId, requestRef.current)) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (isLoading || history.length >= total) return;
    setIsLoading(true);
    setError(null);
    await fetchHistory(false);
  }, [isLoading, history.length, total, fetchHistory]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchHistory(true);
  }, [fetchHistory]);

  useEffect(() => {
    void fetchHistory(true);
    return () => {
      requestRef.current += 1;
      abortRef.current?.abort();
    };
  }, [fetchHistory]);

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
