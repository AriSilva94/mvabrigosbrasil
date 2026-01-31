import type { JSX } from "react";
import PageHeader from "@/components/layout/PageHeader";
import RecoverPasswordForm from "@/app/(auth)/recuperar-senha/components/RecoverPasswordForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Recuperar Senha",
  description:
    "Esqueceu sua senha? Informe seu e-mail para receber um link de recuperação.",
  canonical: "/recuperar-senha",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Recuperar Senha"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Recuperar Senha" },
        ]}
      />

      <RecoverPasswordForm />
    </main>
  );
}
