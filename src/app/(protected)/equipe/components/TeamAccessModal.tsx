"use client";

import { useState } from "react";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Text } from "@/components/ui/typography";
import TeamAccessForm from "./TeamAccessForm";

type TeamAccessModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideDefaultTrigger?: boolean;
  triggerLabel?: string;
};

export default function TeamAccessModal({
  open,
  onOpenChange,
  hideDefaultTrigger = false,
  triggerLabel = "Novo Integrante",
}: TeamAccessModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const modalOpen = typeof open === "boolean" ? open : internalOpen;
  const setModalOpen =
    typeof onOpenChange === "function" ? onOpenChange : setInternalOpen;

  const handleOpen = () => setModalOpen(true);

  return (
    <>
      {!hideDefaultTrigger && (
        <div className="flex justify-center">
          <Button
            type="button"
            className="px-6 py-3 text-base"
            onClick={handleOpen}
          >
            {triggerLabel}
          </Button>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg text-brand-secondary">
                Adicionar pessoa da equipe
              </DialogTitle>
              <Text className="text-sm text-[#6b7280]">
                Preencha os dados para criar um login adicional para o painel do
                abrigo.
              </Text>
            </DialogHeader>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Fechar"
              className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-5">
            <TeamAccessForm />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
