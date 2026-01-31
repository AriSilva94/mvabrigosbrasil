import type { JSX } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ResetPasswordForm from "@/app/(auth)/redefinir-senha/components/ResetPasswordForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Redefinir Senha",
  description: "Defina uma nova senha para sua conta.",
  canonical: "/redefinir-senha",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Redefinir Senha"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Redefinir Senha" },
        ]}
      />

      <ResetPasswordForm />
    </main>
  );
}
