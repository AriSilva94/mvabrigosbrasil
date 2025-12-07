// Client-side navigation placeholder until authentication is wired
"use client";

import type { FormEvent, JSX } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import Input from "@/components/ui/Input";
import { ROUTES } from "@/constants/routes";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

type LoginFormProps = {
  className?: string;
};

export default function LoginForm({ className }: LoginFormProps): JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("log") ?? "").trim();
    const password = String(formData.get("pwd") ?? "");

    if (!email || !password) {
      alert("Preencha e-mail e senha.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const result = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível autenticar.");
      }

      // Replica a sessão no client sem reenviar senha ao Supabase.
      if (result?.accessToken && result?.refreshToken) {
        const supabase = getBrowserSupabaseClient();
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });
      }

      router.push(ROUTES.panel);
    } catch (error) {
      console.error("Erro ao autenticar", error);
      alert(error instanceof Error ? error.message : "Não foi possível autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={clsx("mt-8 w-full max-w-md space-y-5", className)} onSubmit={handleSubmit}>
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
          required
          autoComplete="email"
          className="bg-[#f2f2f2]"
        />
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
          required
          autoComplete="current-password"
          className="bg-[#f2f2f2]"
        />
      </div>

      <div className="pt-2 text-center">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-full bg-brand-primary px-8 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Acessar
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/alterar-senha"
          className="text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
        >
          Perdeu a senha?
        </Link>
      </div>
    </form>
  );
}
