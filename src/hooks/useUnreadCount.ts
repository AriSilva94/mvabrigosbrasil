import { useEffect, useState, useCallback } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCount(0);
        return;
      }

      const { data } = await supabase
        .rpc("get_chat_total_unread_count", { p_profile_id: user.id });

      setCount(data || 0);
    } catch {
      // Silently fail — badge is not critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Polling a cada 30 segundos para atualizar badge
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}
