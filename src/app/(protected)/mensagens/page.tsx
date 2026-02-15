import type { JSX } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ChatInbox from "@/components/chat/ChatInbox";
import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Mensagens",
  description: "Suas conversas com abrigos e voluntários.",
  canonical: "/mensagens",
});

export default async function Page(): Promise<JSX.Element> {
  await enforceTeamAccess("/mensagens");

  return (
    <main>
      <PageHeader
        title="Mensagens"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Mensagens" },
        ]}
      />

      <section className="bg-white">
        <div className="container px-6 py-8">
          <ChatInbox />
        </div>
      </section>
    </main>
  );
}
