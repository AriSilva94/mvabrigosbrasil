"use client";

import type { JSX } from "react";

import Alert from "@/components/ui/Alert";
import { useProfileValidationContext } from "@/components/providers/ProfileValidationProvider";

export default function ProfileUpdateAlert(): JSX.Element | null {
  const { validation, isLoading } = useProfileValidationContext();

  // Não mostra nada enquanto carrega ou se não há dados
  if (isLoading || !validation) return null;

  // Só mostra o alerta se o perfil precisa de atualização
  if (!validation.requiresProfileUpdate) return null;

  return (
    <Alert variant="warning" title="Atualização de Cadastro Necessária">
      <p>
        Estamos passando por atualizações em nosso sistema e identificamos que
        seu cadastro possui informações incompletas ou desatualizadas.
      </p>
      <p className="mt-2">
        Por favor, revise e preencha todos os campos obrigatórios marcados com{" "}
        <span className="font-semibold text-red-600">*</span> para continuar
        utilizando a plataforma.
      </p>
    </Alert>
  );
}
