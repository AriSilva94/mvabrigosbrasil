"use client";

import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { usePresence } from "@/hooks/usePresence";
import ChatWidgetButton from "./ChatWidgetButton";
import ChatWidgetPanel from "./ChatWidgetPanel";
import { listThreads } from "@/modules/chat/chatApi";
import { resolveCurrentThread } from "@/modules/chat/threadMeta";
import type { CurrentThread } from "@/types/chat.types";

export default function ChatWidget() {
  const { user, isLoading: authLoading } = useAuth();
  const { count, refetch, setCount } = useUnreadCount(user?.id);
  const userId = user?.id;
  const { isOnline } = usePresence(userId);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"inbox" | "thread">("inbox");
  const [currentThread, setCurrentThread] = useState<CurrentThread | null>(null);

  // Escutar evento customizado para abrir o widget de fora
  useEffect(() => {
    function handleOpenWidget(e: Event) {
      const detail = (e as CustomEvent).detail;
      setIsOpen(true);
      if (detail?.threadId) {
        const threadId: string = detail.threadId;
        setCurrentThread({
          id: threadId,
          otherName: detail.otherName || "Chat",
          otherProfileId: detail.otherProfileId || "",
          vacancyTitle: detail.vacancyTitle || "Vaga",
        });
        setView("thread");

        if (userId) {
          listThreads()
            .then((threads) => {
              const resolved = resolveCurrentThread(threads, threadId, userId);
              if (resolved) {
                setCurrentThread((current) => (current?.id === threadId ? resolved : current));
              }
            })
            .catch(() => undefined);
        }
      }
      refetch();
    }
    window.addEventListener("open-chat-widget", handleOpenWidget);
    return () => window.removeEventListener("open-chat-widget", handleOpenWidget);
  }, [refetch, userId]);

  // Fechar com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevenir scroll do body no mobile quando aberto
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    refetch();
  }, [refetch]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setView("inbox");
    setCurrentThread(null);
    refetch();
  }, [refetch]);

  const handleSelectThread = useCallback(
    (threadId: string, otherName: string, vacancyTitle: string, otherProfileId: string) => {
      setCurrentThread({ id: threadId, otherName, otherProfileId, vacancyTitle });
      setView("thread");
    },
    [],
  );

  const handleBackToInbox = useCallback(() => {
    setView("inbox");
    setCurrentThread(null);
    refetch();
  }, [refetch]);

  // Não renderizar se não autenticado
  if (authLoading || !user) return null;

  return (
    <>
      {!isOpen && (
        <ChatWidgetButton onClick={handleOpen} unreadCount={count} />
      )}
      <ChatWidgetPanel
        isOpen={isOpen}
        onClose={handleClose}
        view={view}
        currentThread={currentThread}
        onSelectThread={handleSelectThread}
        onBackToInbox={handleBackToInbox}
        onUnreadCountUpdate={setCount}
        isOnline={isOnline}
      />
    </>
  );
}
