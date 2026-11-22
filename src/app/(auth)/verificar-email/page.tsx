import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import VerifyEmailNotice from "@/app/(auth)/verificar-email/components/VerifyEmailNotice";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Confirme seu e-mail",
  description: "Enviamos um link para você confirmar seu e-mail.",
  canonical: "/verificar-email",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Confirme seu e-mail"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Confirme seu e-mail" },
        ]}
      />

      <VerifyEmailNotice />
    </main>
  );
}
