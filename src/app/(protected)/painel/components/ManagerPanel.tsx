import type { JSX } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { Heading, Text } from "@/components/ui/typography";

type ManagerShelter = {
  id: string;
  name: string;
  wp_post_id: number;
};

type ManagerPanelProps = {
  shelters: ManagerShelter[];
};

export default function ManagerPanel({ shelters }: ManagerPanelProps): JSX.Element {
  return (
    <section className="bg-white">
      <div className="container px-6 py-14">
        <div className="mb-8">
          <Heading as="h2" className="text-2xl font-semibold text-[#555a6d]">
            Meus Abrigos
          </Heading>
          <Text className="mt-2 text-sm text-[#7b8191]">
            Você possui acesso somente-leitura a {shelters.length} {shelters.length === 1 ? 'abrigo' : 'abrigos'}
          </Text>
        </div>

        {shelters.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-slate-600">
              Nenhum abrigo vinculado. Entre em contato com o administrador.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shelters.map((shelter) => (
              <li key={shelter.id}>
                <Link
                  href={`/dinamica-populacional/${shelter.wp_post_id}`}
                  className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-10 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,130,89,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <Building2
                    className="h-12 w-12 text-brand-primary transition group-hover:scale-105"
                    aria-hidden
                  />
                  <Heading
                    as="h3"
                    className="mt-4 text-[20px] font-semibold text-[#555a6d]"
                  >
                    {shelter.name}
                  </Heading>
                  <Text className="mt-1 text-sm text-[#7b8191]">
                    Ver Dinâmica Populacional
                  </Text>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
