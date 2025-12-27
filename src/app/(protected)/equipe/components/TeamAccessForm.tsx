"use client";

import type { FormEvent, JSX } from "react";
import { useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";

import { registerSchema } from "@/components/auth/registerSchema";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import { Text } from "@/components/ui/typography";
import { REGISTER_TYPES } from "@/constants/registerTypes";
import { useRegister } from "@/hooks/useRegister";

type FieldErrors = Partial<
  Record<"email" | "password" | "confirmPassword", string>
>;

export default function TeamAccessForm(): JSX.Element {
  const { signUp, isRegistering } = useRegister();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRegistering) return;

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const values = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const issues: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          issues[path as keyof FieldErrors] = issue.message;
        }
      });
      setFieldErrors(issues);
      return;
    }

    try {
      setFieldErrors({});
      await signUp({
        email: values.email,
        password: values.password,
        registerType: REGISTER_TYPES.shelter,
        teamOnly: true,
      });

      toast.success(
        "Acesso criado para a equipe. Compartilhe o e-mail e a senha com a pessoa cadastrada."
      );
      form.reset();
      window.dispatchEvent(new Event("team-users:refresh"));
    } catch (error) {
      console.error("Erro ao cadastrar acesso da equipe", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o acesso. Tente novamente.";
      toast.error(message);
    }
  }

  const inputBaseClass = "bg-[#f2f2f2]";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full space-y-5 rounded-xl border border-slate-100 bg-white px-4 py-5 shadow-[0_10px_30px_rgba(16,130,89,0.06)] md:px-6"
    >
      <div className="space-y-2 text-left">
        <label
          htmlFor="team-email"
          className="text-sm font-semibold text-[#4f5464]"
        >
          E-mail
        </label>
        <Input
          id="team-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "team-email-error" : undefined}
          className={clsx(
            inputBaseClass,
            fieldErrors.email &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="team-email-error" message={fieldErrors.email} />
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="team-password"
          className="text-sm font-semibold text-[#4f5464]"
        >
          Senha
        </label>
        <Input
          id="team-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "team-password-error" : undefined
          }
          className={clsx(
            inputBaseClass,
            fieldErrors.password &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="team-password-error" message={fieldErrors.password} />
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="team-confirm-password"
          className="text-sm font-semibold text-[#4f5464]"
        >
          Confirmar senha
        </label>
        <Input
          id="team-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={
            fieldErrors.confirmPassword
              ? "team-confirm-password-error"
              : undefined
          }
          className={clsx(
            inputBaseClass,
            fieldErrors.confirmPassword &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError
          id="team-confirm-password-error"
          message={fieldErrors.confirmPassword}
        />
      </div>

      <div className="space-y-2 pt-2 text-center">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isRegistering}
        >
          {isRegistering ? "Cadastrando..." : "Cadastrar acesso"}
        </button>
        <Text className="text-sm text-[#7b8191]">
          O login criado não altera sua sessão atual. Envie as credenciais para
          quem vai acessar o painel.
        </Text>
      </div>
    </form>
  );
}
