import { useEffect, useState, useCallback } from "react";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/threads");
      if (!res.ok) {
        setCount(0);
        return;
      }
      const data = await res.json();
      const threads = data.threads || [];
      const total = threads.reduce(
        (sum: number, t: { unread_count?: number }) => sum + (t.unread_count || 0),
        0
      );
      setCount(total);
    } catch {
      // Silently fail — badge is not critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}
