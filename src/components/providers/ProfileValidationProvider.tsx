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


const EXCLUDED_PATHS = [
  ROUTES.profile,
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

    if (isLoading || error || !validation) return;


    if (validation.isValid) return;


    const isExcludedPath = EXCLUDED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isExcludedPath) return;


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
