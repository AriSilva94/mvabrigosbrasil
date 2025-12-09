import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerSchema } from "@/components/auth/registerSchema";
import { ROUTES } from "@/constants/routes";
import { useRegister } from "@/hooks/useRegister";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";
import type { RegisterType } from "@/types/auth.types";

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function useRegisterForm(registerType: RegisterType) {
  const router = useRouter();
  const { signUp, isRegistering } = useRegister();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parseFormValues = useCallback((form: HTMLFormElement): RegisterFormValues => {
    const formData = new FormData(form);
    return {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isRegistering) return;

      const form = event.currentTarget;
      const formValues = parseFormValues(form);
      const parsed = registerSchema.safeParse(formValues);

      if (!parsed.success) {
        const issues: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            issues[path] = issue.message;
          }
        });
        setFieldErrors(issues);
        return;
      }

      setFieldErrors({});

      try {
        await signUp({
          email: formValues.email,
          password: formValues.password,
          registerType,
        });

        // Se o Supabase nao devolver sessao automaticamente, tenta logar direto.
        const supabase = getBrowserSupabaseClient();
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: formValues.email,
          password: formValues.password,
        });

        if (loginError) {
          throw loginError;
        }

        if (loginData.session) {
          toast.success("Cadastro realizado com sucesso!");
          router.push(ROUTES.panel);
          return;
        }

        toast.success("Cadastro criado. Voce ja pode acessar o painel.");
        form.reset();
      } catch (error) {
        console.error("Erro ao registrar", error);
        const message =
          error instanceof Error ? error.message : "Nao foi possivel concluir o cadastro.";
        toast.error(message);
      }
    },
    [isRegistering, parseFormValues, registerType, router, signUp],
  );

  return useMemo(
    () => ({
      fieldErrors,
      isRegistering,
      handleSubmit,
    }),
    [fieldErrors, handleSubmit, isRegistering],
  );
}
