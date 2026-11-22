"use client";

import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import { Heading, Text } from "@/components/ui/typography";
import { apiClient } from "@/lib/api/client";
import { isInvalidPasswordError } from "@/lib/auth/emailVerification";

type Status = "form" | "success" | "invalid";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10";
const headingClass =
  "text-[22px] font-semibold text-brand-secondary md:text-[24px]";

export default function ConfirmEmailStatus(): JSX.Element {
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get("token"));
  const [status, setStatus] = useState<Status>(token ? "form" : "invalid");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();

  // O token não pode ficar no histórico nem em capturas de tela.
  useEffect(() => {
    if (searchParams.has("token")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  // A senha é exigida para que o link, sozinho, não ative uma conta cadastrada
  // por outra pessoa com o e-mail de quem o recebeu.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !token) return;

    const password = String(
      new FormData(event.currentTarget).get("password") ?? "",
    );
    if (!password) {
      setPasswordError("Informe a senha.");
      return;
    }

    setPasswordError(undefined);
    setIsSubmitting(true);
    try {
      await apiClient("/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      setStatus("success");
    } catch (error) {
      if (isInvalidPasswordError(error)) {
        setPasswordError("Senha incorreta.");
      } else {
        setStatus("invalid");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="bg-white pb-16 pt-8"
      aria-labelledby="confirm-email-title"
    >
      <div className="container px-6">
        <div className="mx-auto max-w-3xl">
          <div className={cardClass} aria-live="polite">
            {status === "form" ? (
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <header className="space-y-2 text-center">
                  <Heading
                    as="h2"
                    id="confirm-email-title"
                    className={headingClass}
                  >
                    Confirme seu e-mail
                  </Heading>
                  <Text className="text-base leading-relaxed text-[#68707b]">
                    Para ativar a conta, digite a senha que você criou no
                    cadastro.
                  </Text>
                </header>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#4f5464]"
                  >
                    Senha
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                      passwordError ? "password-error" : undefined
                    }
                  />
                  <FormError id="password-error" message={passwordError} />
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    className="px-10 py-3 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          className="mr-2 h-5 w-5 animate-spin"
                          aria-hidden
                        />
                        Confirmando...
                      </>
                    ) : (
                      "Confirmar e-mail"
                    )}
                  </Button>
                </div>
              </form>
            ) : null}

            {status === "success" ? (
              <div className="space-y-4 text-center">
                <Heading
                  as="h2"
                  id="confirm-email-title"
                  className={headingClass}
                >
                  E-mail confirmado!
                </Heading>
                <Text className="text-base leading-relaxed text-[#68707b]">
                  Sua conta está ativa. Agora é só fazer login.
                </Text>
                <Link
                  href="/login"
                  className="inline-flex rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white transition hover:bg-brand-primary/90"
                >
                  Fazer login
                </Link>
              </div>
            ) : null}

            {status === "invalid" ? (
              <div className="space-y-4 text-center">
                <Heading
                  as="h2"
                  id="confirm-email-title"
                  className={headingClass}
                >
                  Link inválido ou expirado
                </Heading>
                <Text className="text-base leading-relaxed text-[#68707b]">
                  O link de confirmação já foi usado ou venceu. Faça login com
                  seu e-mail e senha para pedir um novo.
                </Text>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
                >
                  Ir para o login
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
