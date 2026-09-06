import { useCallback, useState } from "react";

import { apiClient } from "@/lib/api/client";
import type { RegisterType } from "@/types/auth.types";

type RegisterParams = {
  email: string;
  password: string;
  registerType: RegisterType;
  teamOnly?: boolean;
};

export function useRegister() {
  const [isRegistering, setIsRegistering] = useState(false);

  const signUp = useCallback(
    async ({ email, password, registerType, teamOnly }: RegisterParams) => {
      setIsRegistering(true);
      try {
        return await apiClient("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, registerType, teamOnly }),
        });
      } finally {
        setIsRegistering(false);
      }
    },
    [],
  );

  return { signUp, isRegistering };
}
