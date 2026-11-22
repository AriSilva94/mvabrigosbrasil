"use client";

import type { JSX } from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";

import ResendVerificationButton from "@/components/auth/ResendVerificationButton";
import { Heading, Text } from "@/components/ui/typography";
import { readPendingVerificationEmail } from "@/lib/auth/emailVerification";

const subscribeToNothing = () => () => undefined;
const serverSnapshot = () => null;

export default function VerifyEmailNotice(): JSX.Element {
  const email = useSyncExternalStore(
    subscribeToNothing,
    readPendingVerificationEmail,
    serverSnapshot,
  );

  return (
    <section
      className="bg-white pb-16 pt-8"
      aria-labelledby="verify-email-title"
    >
      <div className="container px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10 md:py-10">
            <header className="mb-6 space-y-2 text-center">
              <Heading
                as="h2"
                id="verify-email-title"
                className="text-[22px] font-semibold text-brand-secondary md:text-[24px]"
              >
                Confira sua caixa de entrada
              </Heading>
              <Text className="text-base leading-relaxed text-[#68707b]">
                {email
                  ? `Enviamos um link de confirmação para ${email}. `
                  : "Enviamos um link de confirmação para o seu e-mail. "}
                Clique nele para ativar a conta e fazer login. Se não
                encontrar, verifique a pasta de spam.
              </Text>
            </header>

            <div className="flex flex-col items-center gap-4 pt-4">
              {email ? <ResendVerificationButton email={email} /> : null}
              <Link
                href="/login"
                className="text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
              >
                Ir para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
