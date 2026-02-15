"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Text, Heading } from "@/components/ui/typography";
import { openChatWidget } from "@/components/chat-widget";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface Application {
  id: string;
  status: string;
  applied_at: string;
  volunteers: {
    id: string;
    name: string;
    cidade?: string | null;
    estado?: string | null;
    telefone?: string | null;
    profissao?: string | null;
    experiencia?: string | null;
    slug: string | Json | undefined;
  };
}

export default function ApplicationsList({
  applications,
  threadMap = {},
}: {
  applications: Application[];
  threadMap?: Record<string, string>;
}) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <Text className="text-slate-600">Nenhum candidato ainda.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading as="h2" className="text-xl font-semibold text-brand-secondary">
        {applications.length} candidato{applications.length !== 1 ? "s" : ""}
      </Heading>

      <div className="grid gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="flex-1">
              <Heading as="h3" className="text-lg font-semibold text-brand-primary">
                {app.volunteers.name}
              </Heading>

              {(app.volunteers.cidade || app.volunteers.estado) && (
                <Text className="text-sm text-slate-600">
                  📍{" "}
                  {[app.volunteers.cidade, app.volunteers.estado]
                    .filter(Boolean)
                    .join(" - ")}
                </Text>
              )}

              {app.volunteers.profissao && (
                <Text className="text-sm text-slate-600">
                  💼 {app.volunteers.profissao}
                </Text>
              )}

              {app.volunteers.telefone && (
                <Text className="text-sm text-slate-600">
                  📞 {app.volunteers.telefone}
                </Text>
              )}

              <Text className="mt-2 text-xs text-slate-500">
                Candidatou-se em:{" "}
                {new Date(app.applied_at).toLocaleDateString("pt-BR")}
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              {app.volunteers.slug && (
                <Link
                  href={`/voluntario/${String(app.volunteers.slug)}`}
                  className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Ver Perfil
                </Link>
              )}
              {threadMap[app.volunteers.id] && (
                <button
                  type="button"
                  onClick={() =>
                    openChatWidget({ threadId: threadMap[app.volunteers.id] })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Conversar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
