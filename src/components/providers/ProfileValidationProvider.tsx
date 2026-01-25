"use client";

import { createContext, useContext, useEffect, type JSX, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  useProfileValidation,
  type ProfileValidationResult,
} from "@/hooks/useProfileValidation";
import { ROUTES } from "@/constants/routes";

type ProfileValidationContextValue = {
  validation: ProfileValidationResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const ProfileValidationContext = createContext<ProfileValidationContextValue | null>(null);

// Rotas que não devem ter redirecionamento forçado
const EXCLUDED_PATHS = [
  ROUTES.profile, // /meu-cadastro - destino do redirect
  "/login",
  "/cadastrar",
  "/recuperar-senha",
  "/confirmar-email",
];

type ProfileValidationProviderProps = {
  children: ReactNode;
};

export default function ProfileValidationProvider({
  children,
}: ProfileValidationProviderProps): JSX.Element {
  const { validation, isLoading, error, refetch } = useProfileValidation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Não faz nada se ainda está carregando ou se houve erro
    if (isLoading || error || !validation) return;

    // Se o perfil é válido, não precisa redirecionar
    if (validation.isValid) return;

    // Verifica se está em uma rota excluída
    const isExcludedPath = EXCLUDED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isExcludedPath) return;

    // Redireciona para meu-cadastro se precisa atualizar o perfil
    if (validation.requiresProfileUpdate) {
      router.push(ROUTES.profile);
    }
  }, [validation, isLoading, error, pathname, router]);

  return (
    <ProfileValidationContext.Provider
      value={{ validation, isLoading, error, refetch }}
    >
      {children}
    </ProfileValidationContext.Provider>
  );
}

export function useProfileValidationContext(): ProfileValidationContextValue {
  const context = useContext(ProfileValidationContext);
  if (!context) {
    throw new Error(
      "useProfileValidationContext deve ser usado dentro de ProfileValidationProvider"
    );
  }
  return context;
}
