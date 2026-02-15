"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

export function usePresence(userId: string | undefined) {
  const [, setTick] = useState(0);
  const onlineIdsRef = useRef<Set<string>>(new Set());

  const updateOnlineIds = useCallback((ids: Set<string>) => {
    onlineIdsRef.current = ids;
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const supabase = getBrowserSupabaseClient();

    const channel = supabase.channel("presence-online", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>(Object.keys(state));
        updateOnlineIds(ids);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        const next = new Set(onlineIdsRef.current);
        next.add(key);
        updateOnlineIds(next);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        const next = new Set(onlineIdsRef.current);
        next.delete(key);
        updateOnlineIds(next);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, updateOnlineIds]);

  // A ref é atualizada por updateOnlineIds que também chama setTick,
  // forçando re-render e gerando nova referência de isOnline para os consumidores.
  // Deps vazio é intencional: a leitura sempre pega o valor atual da ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isOnline = useCallback(
    (profileId: string) => onlineIdsRef.current.has(profileId),
    []
  );

  return { isOnline, onlineCount: onlineIdsRef.current.size };
}
