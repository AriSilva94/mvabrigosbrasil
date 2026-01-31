import type { JSX } from "react";
import { redirect } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ChangePasswordForm from "@/app/(protected)/alterar-senha/components/ChangePasswordForm";
import { buildMetadata } from "@/lib/seo";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";

export const metadata = buildMetadata({
  title: "Alterar Senha",
  description:
    "Área para redefinir a senha da sua conta no projeto Medicina de Abrigos Brasil.",
  canonical: "/alterar-senha",
});

export default async function Page(): Promise<JSX.Element> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data } = await supabase.auth.getUser();

  if (!data.user?.email) {
    redirect("/login");
  }

  return (
    <main>
      <PageHeader
        title="Alterar Senha"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Alterar Senha" },
        ]}
      />

      <ChangePasswordForm userEmail={data.user.email} />
    </main>
  );
}
