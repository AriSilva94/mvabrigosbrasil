import type { JSX } from "react";

import RegisterForm from "@/components/auth/RegisterForm";
import PageHeader from "@/components/layout/PageHeader";
import { normalizeRegisterType, REGISTER_TYPES, type RegisterType } from "@/constants/registerTypes";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cadastro",
  description:
    "Crie sua conta como abrigo ou voluntário para registrar dados, publicar vagas e acessar treinamentos.",
  canonical: "/register",
});

export const dynamic = "force-dynamic";

type PageSearchParams = {
  tipo?: string | string[];
};

type PageProps = {
  searchParams?: PageSearchParams | Promise<PageSearchParams | undefined>;
};

function parseRegisterType(rawType?: string | string[]): RegisterType | undefined {
  if (!rawType) return undefined;

  const value = Array.isArray(rawType) ? rawType[0] : rawType;

  return normalizeRegisterType(value) ?? undefined;
}

export default async function Page({ searchParams }: PageProps): Promise<JSX.Element> {
  const resolvedSearchParams = await searchParams;
  const parsedType = parseRegisterType(resolvedSearchParams?.tipo);
  const registerType: RegisterType = parsedType ?? REGISTER_TYPES.shelter;

  return (
    <main>
      <PageHeader
        title="Cadastro"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Cadastro" },
        ]}
      />

      <section className="bg-white">
        <div className="container px-6 py-16">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <RegisterForm registerType={registerType} />
          </div>
        </div>
      </section>
    </main>
  );
}

