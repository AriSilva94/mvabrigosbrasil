import { useCallback, useState } from "react";

import type { RegisterType } from "@/types/auth.types";

type RegisterParams = {
  email: string;
  password: string;
  registerType: RegisterType;
};

export function useRegister() {
  const [isRegistering, setIsRegistering] = useState(false);

  const signUp = useCallback(
    async ({ email, password, registerType }: RegisterParams) => {
      setIsRegistering(true);
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, registerType }),
        });

        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const result = isJson ? await response.json() : null;

        if (!response.ok) {
          throw new Error(result?.error || "Nao foi possivel concluir o cadastro.");
        }

        return result;
      } finally {
        setIsRegistering(false);
      }
    },
    [],
  );

  return { signUp, isRegistering };
}
