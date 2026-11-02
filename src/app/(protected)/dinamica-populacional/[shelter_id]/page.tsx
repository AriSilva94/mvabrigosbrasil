import type { JSX } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import PageHeader from "@/components/layout/PageHeader";
import PopulationDynamicsContent from "../components/PopulationDynamicsContent";
import { buildMetadata } from "@/lib/seo";
import {
  loadManagerPopulationDynamicsPageData,
  parseShelterWpPostIdParam,
} from "@/modules/dynamics/dynamicsPageData";

type PageParams = {
  shelter_id: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { shelter_id } = await params;

  return buildMetadata({
    title: "Dinâmica Populacional",
    description: "Visualização da dinâmica populacional do abrigo.",
    canonical: `/dinamica-populacional/${shelter_id}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<JSX.Element> {
  const { shelter_id } = await params;
  const shelterId = parseShelterWpPostIdParam(shelter_id);

  if (shelterId === null) {
    notFound();
  }

  const pageData = await loadManagerPopulationDynamicsPageData(
    shelter_id,
    shelterId,
  );
  if (!pageData) notFound();
  const { userSummary } = pageData;

  return (
    <main>
      <PageHeader
        title="Dinâmica Populacional"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Dinâmica Populacional" },
        ]}
      />

      <PopulationDynamicsContent
        userSummary={userSummary}
        isTeamOnly={true}
        shelterWpPostId={shelterId}
      />
    </main>
  );
}
