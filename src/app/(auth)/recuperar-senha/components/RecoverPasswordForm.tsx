"use client";

import type { FormEvent, JSX } from "react";
import { useState } from "react";
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

const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Informe um e-mail válido." });

export default function RecoverPasswordForm(): JSX.Element {
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const inputBaseClass = "bg-[#f2f2f2]";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setFieldErrors({ email: parsed.error.issues[0]?.message });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        toast.error("Não foi possível enviar o e-mail. Tente novamente.");
        return;
      }

      setEmailSent(true);
      toast.success("E-mail enviado com sucesso!");
    } catch {
      toast.error("Erro ao processar a solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (emailSent) {
    return (
      <section
        className="bg-white pb-16 pt-8"
        aria-labelledby="recover-password-title"
      >
        <div className="container px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
              <header className="mb-6 space-y-2 text-center">
                <Heading
                  as="h2"
                  id="recover-password-title"
                  className="text-[22px] font-semibold text-brand-secondary md:text-[24px]"
                >
                  E-mail enviado!
                </Heading>
                <Text className="text-base leading-relaxed text-[#68707b]">
                  Verifique sua caixa de entrada e siga as instruções para
                  redefinir sua senha. Se não encontrar, verifique a pasta de
                  spam.
                </Text>
              </header>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
                >
                  Voltar para o login
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
      aria-labelledby="recover-password-title"
    >
      <div className="container px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
            <header className="mb-6 space-y-2 text-left">
              <Heading
                as="h2"
                id="recover-password-title"
                className="text-[22px] font-semibold text-brand-secondary md:text-[24px]"
              >
                Esqueceu sua senha?
              </Heading>
              <Text className="text-base leading-relaxed text-[#68707b]">
                Informe o e-mail cadastrado e enviaremos um link para você
                redefinir sua senha.
              </Text>
            </header>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2 text-left">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#4f5464]"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  className={clsx(
                    inputBaseClass,
                    fieldErrors.email &&
                      "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
                  )}
                />
                <FormError id="email-error" message={fieldErrors.email} />
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
                      Enviando...
                    </>
                  ) : (
                    "Enviar link"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
                >
                  Voltar para o login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
