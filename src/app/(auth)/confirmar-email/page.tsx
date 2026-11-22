import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ConfirmEmailStatus from "@/app/(auth)/confirmar-email/components/ConfirmEmailStatus";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Confirmar e-mail",
  description: "Confirmando o seu e-mail.",
  canonical: "/confirmar-email",
});

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Confirmar e-mail"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Confirmar e-mail" },
        ]}
      />

      <ConfirmEmailStatus />
    </main>
  );
}
