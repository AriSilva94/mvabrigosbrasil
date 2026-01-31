"use client";

import type { FormEvent, JSX } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/typography";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"newPassword" | "confirmPassword", string>>;

export default function ResetPasswordForm(): JSX.Element {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const inputBaseClass = "bg-[#f2f2f2]";

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    // Check if user has a valid session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      newPassword: String(formData.get("newPassword") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = passwordSchema.safeParse(values);
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

    try {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) {
        toast.error("Não foi possível redefinir a senha. Tente novamente.");
        return;
      }

      toast.success("Senha redefinida com sucesso!");
      router.push("/login");
    } catch {
      toast.error("Erro ao processar a solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isValidSession === null) {
    return (
      <section className="bg-white pb-16 pt-8">
        <div className="container px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!isValidSession) {
    return (
      <section className="bg-white pb-16 pt-8">
        <div className="container px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
              <header className="mb-6 space-y-2 text-center">
                <Heading
                  as="h2"
                  className="text-[22px] font-semibold text-brand-secondary md:text-[24px]"
                >
                  Link inválido ou expirado
                </Heading>
                <Text className="text-base leading-relaxed text-[#68707b]">
                  O link de recuperação de senha é inválido ou já expirou.
                  Solicite um novo link.
                </Text>
              </header>

              <div className="pt-4 text-center">
                <Link
                  href="/recuperar-senha"
                  className="inline-flex justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90"
                >
                  Solicitar novo link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-white pb-16 pt-8"
      aria-labelledby="reset-password-title"
    >
      <div className="container px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
            <header className="mb-6 space-y-2 text-left">
              <Heading
                as="h2"
                id="reset-password-title"
                className="text-[22px] font-semibold text-brand-secondary md:text-[24px]"
              >
                Defina sua nova senha
              </Heading>
              <Text className="text-base leading-relaxed text-[#68707b]">
                Escolha uma senha segura com pelo menos 6 caracteres.
              </Text>
            </header>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2 text-left">
                <label
                  htmlFor="new-password"
                  className="text-sm font-semibold text-[#4f5464]"
                >
                  Nova Senha
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
                  htmlFor="confirm-password"
                  className="text-sm font-semibold text-[#4f5464]"
                >
                  Confirmar Nova Senha
                </label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  className={clsx(
                    inputBaseClass,
                    fieldErrors.confirmPassword &&
                      "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
                  )}
                />
                <FormError
                  id="confirm-password-error"
                  message={fieldErrors.confirmPassword}
                />
              </div>

              <div className="pt-2 text-center">
                <Button
                  type="submit"
                  className="px-10 py-3 text-base shadow-[0_12px_30px_rgba(16,130,89,0.2)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-5 w-5 animate-spin"
                        aria-hidden
                      />
                      Salvando...
                    </>
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
