"use client";

import type { FormEvent, JSX } from "react";
import { useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";

import { changePasswordSchema } from "@/components/auth/changePasswordSchema";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/typography";

type ChangePasswordFormProps = {
  userEmail: string;
};

type FieldErrors = Partial<
  Record<"currentPassword" | "newPassword" | "confirmNewPassword", string>
>;

export default function ChangePasswordForm({
  userEmail,
}: ChangePasswordFormProps): JSX.Element {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputBaseClass = "bg-[#f2f2f2]";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      currentPassword: String(formData.get("currentPassword") ?? ""),
      newPassword: String(formData.get("newPassword") ?? ""),
      confirmNewPassword: String(formData.get("confirmNewPassword") ?? ""),
    };

    const parsed = changePasswordSchema.safeParse(values);
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

    setFieldErrors({});
    setIsSubmitting(true);
    toast.success("Dados validados. Integração com backend pendente.");
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <section
      className="bg-white pb-16 pt-8"
      aria-labelledby="change-password-title"
    >
      <div className="container px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
            <header className="mb-6 space-y-2 text-left">
              <Heading
                as="h2"
                id="change-password-title"
                className="text-[22px] font-semibold text-brand-secondary md:text-[24px]"
              >
                Mantenha sua conta segura
              </Heading>
              <Text className="text-base leading-relaxed text-[#68707b]">
                Atualize a senha do seu acesso sempre que necessário. Use pelo
                menos 6 caracteres e escolha uma combinação única.
              </Text>
            </header>

            <div className="mb-6 flex items-center border-b border-slate-200 pb-4">
              <Text className="text-base text-[#4f5464]">
                <span className="font-semibold text-brand-secondary">
                  Usuário:
                </span>{" "}
                {userEmail}
              </Text>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2 text-left">
                <label
                  htmlFor="current-password"
                  className="text-sm font-semibold text-[#4f5464]"
                >
                  Senha Atual
                </label>
                <Input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(fieldErrors.currentPassword)}
                  aria-describedby={
                    fieldErrors.currentPassword
                      ? "current-password-error"
                      : undefined
                  }
                  className={clsx(
                    inputBaseClass,
                    fieldErrors.currentPassword &&
                      "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
                  )}
                />
                <FormError
                  id="current-password-error"
                  message={fieldErrors.currentPassword}
                />
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="new-password"
                  className="text-sm font-semibold text-[#4f5464]"
                >
                  Nova Senha (mínimo 6 dígitos)
                </label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  aria-describedby={
                    fieldErrors.newPassword ? "new-password-error" : undefined
                  }
                  className={clsx(
                    inputBaseClass,
                    fieldErrors.newPassword &&
                      "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
                  )}
                />
                <FormError
                  id="new-password-error"
                  message={fieldErrors.newPassword}
                />
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="confirm-new-password"
                  className="text-sm font-semibold text-[#4f5464]"
                >
                  Repetir Nova Senha
                </label>
                <Input
                  id="confirm-new-password"
                  name="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(fieldErrors.confirmNewPassword)}
                  aria-describedby={
                    fieldErrors.confirmNewPassword
                      ? "confirm-new-password-error"
                      : undefined
                  }
                  className={clsx(
                    inputBaseClass,
                    fieldErrors.confirmNewPassword &&
                      "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
                  )}
                />
                <FormError
                  id="confirm-new-password-error"
                  message={fieldErrors.confirmNewPassword}
                />
              </div>

              <div className="pt-2 text-center">
                <Button
                  type="submit"
                  className="px-10 py-3 text-base shadow-[0_12px_30px_rgba(16,130,89,0.2)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Validando..." : "Alterar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
