"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import type { ConsentCategories } from "@/lib/cookies/consent";

type CategoryInfo = {
  key: keyof ConsentCategories;
  label: string;
  description: string;
  locked?: boolean;
};

const CATEGORIES: CategoryInfo[] = [
  {
    key: "necessary",
    label: "Necessários",
    description: "Cookies essenciais para autenticação e funcionamento básico do site.",
    locked: true,
  },
  {
    key: "analytics",
    label: "Analíticos",
    description: "Nos ajudam a entender como você usa o site para melhorar a experiência.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Utilizados para exibir conteúdo e anúncios relevantes ao seu perfil.",
  },
  {
    key: "thirdPartyEmbeds",
    label: "Conteúdo de terceiros",
    description: "Permitem exibir conteúdo externo como vídeos e mapas incorporados.",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: ConsentCategories;
  onSave: (categories: ConsentCategories) => void;
};

export default function CookiePreferencesModal({ open, onOpenChange, initialValues, onSave }: Props) {
  const [values, setValues] = useState<ConsentCategories>(initialValues);

  const handleToggle = (key: keyof ConsentCategories) => {
    if (key === "necessary") return;
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-brand-primary">Configurar cookies</DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-sm leading-relaxed text-text-default">
          Personalize quais categorias de cookies você permite. Cookies necessários não podem ser desativados.
        </p>

        <div className="mt-4 space-y-3">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors duration-200 hover:border-brand-primary/40 hover:bg-brand-primary/5"
            >
              <span className="relative mt-0.5 flex h-5 w-9 shrink-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={values[cat.key]}
                  disabled={cat.locked}
                  onChange={() => handleToggle(cat.key)}
                />
                <span className="absolute inset-0 cursor-pointer rounded-full bg-gray-300 transition peer-checked:bg-brand-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-[14px]" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-brand-primary">
                  {cat.label}
                  {cat.locked && (
                    <span className="ml-2 text-xs font-normal text-text-default">(sempre ativo)</span>
                  )}
                </span>
                <span className="block text-xs leading-relaxed text-text-default">{cat.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar preferências
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
