// Client-side placeholder until registration API is available
"use client";

import type { FormEvent, JSX } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import clsx from "clsx";

import RegisterActionLinks from "@/components/auth/RegisterActionLinks";
import RegisterField from "@/components/auth/RegisterField";
import RegisterPasswordFields from "@/components/auth/RegisterPasswordFields";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import { Heading, Text } from "@/components/ui/typography";
import { REGISTER_CONTENT } from "@/constants/register";
import type { RegisterType } from "@/types/auth.types";

type RegisterFormProps = {
  registerType: RegisterType;
  className?: string;
};

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const emailSchema = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Informe um e-mail valido." });

const registerSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(12, "A senha deve ter pelo menos 12 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam coincidir.",
  });

export default function RegisterForm({
  registerType,
  className,
}: RegisterFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const registerContent = useMemo(
    () => REGISTER_CONTENT[registerType],
    [registerType]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const formValues: RegisterFormValues = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

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

    setIsSubmitting(true);

    try {
      // TODO: integrar com endpoint real de registro
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success("Cadastro enviado! Em breve integraremos com o backend.");
      event.currentTarget.reset();
    } catch (error) {
      console.error("Erro ao registrar", error);
      toast.error("Nao foi possivel concluir o cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={clsx("w-full max-w-md space-y-6 p-2 text-left", className)}
    >
      <header className="space-y-1 text-center">
        <Heading as="h3" className="text-[22px] font-semibold text-[#555a6d]">
          {registerContent.title}
        </Heading>
      </header>

      <input type="hidden" name="registerType" value={registerType} />

      <RegisterField id="email" label="E-mail" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "register-email-error" : undefined
          }
          className={clsx(
            "bg-[#f2f2f2]",
            fieldErrors.email &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="register-email-error" message={fieldErrors.email} />
      </RegisterField>

      <RegisterPasswordFields
        errors={{
          password: fieldErrors.password,
          confirmPassword: fieldErrors.confirmPassword,
        }}
      />

      <div className="pt-2 text-center">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Cadastrar"}
        </button>
      </div>

      <RegisterActionLinks />

      <Text className="text-center text-xs text-[#9ba1ad]">
        Ao clicar em &quot;Cadastrar&quot; voce concorda com os Termos de Uso e
        a Politica de Privacidade.
      </Text>
    </form>
  );
}
