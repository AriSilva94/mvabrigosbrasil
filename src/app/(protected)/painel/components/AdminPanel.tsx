import type { JSX } from "react";
import Link from "next/link";
import { Users, Building2 } from "lucide-react";

import { Heading, Text } from "@/components/ui/typography";

export default function AdminPanel(): JSX.Element {
  return (
    <section className="bg-white">
      <div className="container px-6 py-14">
        <article
          className="flex flex-col gap-3 rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 text-purple-900 shadow-sm md:flex-row md:items-center md:justify-between"
          role="alert"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              Painel Administrativo{" "}
              <span className="font-normal">
                Gerencie gerentes e abrigos da plataforma.
              </span>
            </p>
          </div>
        </article>

        <section className="mt-10">
          <ul className="grid gap-5 md:grid-cols-2">
            <li>
              <Link
                href="/admin/gerentes"
                className="group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-[#f5f5f6] px-6 py-10 text-center transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(16,130,89,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <Users
                  className="h-12 w-12 text-brand-primary transition group-hover:scale-105"
                  aria-hidden
                />
                <Heading
                  as="h3"
                  className="mt-4 text-[20px] font-semibold text-[#555a6d]"
                >
                  Gerenciar Gerentes
                </Heading>
                <Text className="mt-1 text-sm text-[#7b8191]">
                  Cadastrar e vincular gerentes aos abrigos
                </Text>
              </Link>
            </li>

            {/* <li>
              <Link
                href="/admin/abrigos"
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
                  Banco de Abrigos
                </Heading>
                <Text className="mt-1 text-sm text-[#7b8191]">
                  Visualizar todos os abrigos cadastrados
                </Text>
              </Link>
            </li> */}
          </ul>
        </section>
      </div>
    </section>
  );
}
