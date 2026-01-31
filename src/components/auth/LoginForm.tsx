// Client-side navigation placeholder until authentication is wired
"use client";

import type { FormEvent, JSX } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import clsx from "clsx";

import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";
import { resolvePostLoginRedirect } from "@/lib/auth/postLoginRedirect";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

type LoginFormProps = {
  className?: string;
};

type LoginFormValues = {
  email: string;
  password: string;
};

const emailSchema = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Informe um e-mail valido." });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha."),
});

export default function LoginForm({ className }: LoginFormProps): JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const values: LoginFormValues = {
      email: String(formData.get("log") ?? "").trim(),
      password: String(formData.get("pwd") ?? ""),
    };

    const parsed = loginSchema.safeParse(values);
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
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const result = isJson ? await response.json() : null;

      if (!response.ok) {
        const message = result?.error || "Nao foi possivel autenticar.";

        if (response.status === 401) {
          setFieldErrors({ password: message });
          toast.error(message);
          return;
        }

        if (response.status === 404) {
          setFieldErrors({ email: message });
          toast.error(message);
          return;
        }

        throw new Error(message);
      }

      // Replica a sessao no client sem reenviar senha ao Supabase.
      if (result?.accessToken && result?.refreshToken) {
        const supabase = getBrowserSupabaseClient();
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });
      }

      const redirectTo = await resolvePostLoginRedirect();
      router.push(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel autenticar.";
      console.error("Erro ao autenticar", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={clsx("mt-8 w-full max-w-md space-y-5", className)}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="space-y-2 text-left">
        <label
          htmlFor="user_login"
          className="text-sm font-semibold text-[#4f5464]"
        >
          E-mail
        </label>
        <Input
          id="user_login"
          name="log"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          className={clsx(
            "bg-[#f2f2f2]",
            fieldErrors.email &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="login-email-error" message={fieldErrors.email} />
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="user_pass"
          className="text-sm font-semibold text-[#4f5464]"
        >
          Senha
        </label>
        <Input
          id="user_pass"
          name="pwd"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "login-password-error" : undefined
          }
          className={clsx(
            "bg-[#f2f2f2]",
            fieldErrors.password &&
              "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
          )}
        />
        <FormError id="login-password-error" message={fieldErrors.password} />
      </div>

      <div className="pt-2 text-center">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Acessando...
            </>
          ) : (
            "Acessar"
          )}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/recuperar-senha"
          className="text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
        >
          Perdeu a senha?
        </Link>
      </div>
    </form>
  );
}
