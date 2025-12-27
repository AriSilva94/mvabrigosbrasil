import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ChangePasswordForm from "@/app/(protected)/alterar-senha/components/ChangePasswordForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Alterar Senha",
  description:
    "Área para redefinir a senha da sua conta no projeto Medicina de Abrigos Brasil.",
  canonical: "/alterar-senha",
});

const USER_EMAIL_PLACEHOLDER = "teste@teste.com";

export default async function Page(): Promise<JSX.Element> {
  return (
    <main>
      <PageHeader
        title="Alterar Senha"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Alterar Senha" },
        ]}
      />

      <ChangePasswordForm userEmail={USER_EMAIL_PLACEHOLDER} />
    </main>
  );
}
