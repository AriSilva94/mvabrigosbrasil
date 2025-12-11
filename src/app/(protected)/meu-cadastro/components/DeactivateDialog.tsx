"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";
import clsx from "clsx";

interface DeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isActive: boolean;
}

export function DeactivateDialog({
  open,
  onOpenChange,
  onConfirm,
  isActive,
}: DeactivateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#2f3b52]">
            <AlertTriangle className={clsx("h-5 w-5", isActive ? "text-amber-500" : "text-brand-primary")} />
            {isActive ? "Inativar Cadastro" : "Reativar Cadastro"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-[#4f5464]">
          {isActive ? (
            <>
              <p>
                Ao inativar, seu abrigo <strong>não aparecerá</strong> nas buscas públicas e nos relatórios gerais.
              </p>
              <p>Você pode reativar a qualquer momento.</p>
            </>
          ) : (
            <p>
              Ao reativar, seu abrigo volta a aparecer nas buscas públicas e relatórios da plataforma.
            </p>
          )}
          <p className="font-semibold text-[#2f3b52]">
            {isActive ? "Deseja inativar este cadastro?" : "Deseja reativar este cadastro?"}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[130px] justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Processando...
              </>
            ) : isActive ? (
              "Inativar"
            ) : (
              "Reativar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
