"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Text } from "@/components/ui/typography";

interface DeleteVacancyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancyId: string;
  vacancyTitle: string;
  onDeleted: () => void;
}

export default function DeleteVacancyDialog({
  open,
  onOpenChange,
  vacancyId,
  vacancyTitle,
  onDeleted,
}: DeleteVacancyDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/vacancies/${vacancyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar vaga");
      }

      toast.success("Vaga deletada com sucesso!");
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao deletar vaga:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao deletar vaga"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-secondary">
            Confirmar exclusão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Text className="text-sm text-[#68707b]">
            Tem certeza que deseja excluir a vaga{" "}
            <strong className="text-brand-secondary">{vacancyTitle}</strong>?
          </Text>

          <Text className="text-sm text-red-600 font-medium">
            Esta ação não pode ser desfeita.
          </Text>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Excluindo..." : "Excluir vaga"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
