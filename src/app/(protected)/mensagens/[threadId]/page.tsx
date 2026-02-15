import type { JSX } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import ChatThread from "@/components/chat/ChatThread";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function Page({ params }: PageProps): Promise<JSX.Element> {
  const { threadId } = await params;

  // 1. Autenticar
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Buscar thread e verificar participação
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: thread } = await supabaseAdmin
    .from("chat_threads")
    .select(`
      id,
      status,
      vacancy_id,
      volunteer_profile_id,
      shelter_profile_id,
      shelter_id,
      volunteer_id
    `)
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) {
    redirect("/mensagens");
  }

  const isParticipant =
    thread.volunteer_profile_id === user.id ||
    thread.shelter_profile_id === user.id;

  if (!isParticipant) {
    redirect("/mensagens");
  }

  // 3. Buscar nome do outro participante e título da vaga
  const [vacancyRes, shelterRes, volunteerRes] = await Promise.all([
    supabaseAdmin
      .from("vacancies")
      .select("title")
      .eq("id", thread.vacancy_id)
      .maybeSingle(),
    supabaseAdmin
      .from("shelters")
      .select("name")
      .eq("id", thread.shelter_id)
      .maybeSingle(),
    supabaseAdmin
      .from("volunteers")
      .select("name")
      .eq("id", thread.volunteer_id)
      .maybeSingle(),
  ]);

  const isVolunteer = thread.volunteer_profile_id === user.id;
  const otherName = isVolunteer
    ? shelterRes.data?.name || "Abrigo"
    : volunteerRes.data?.name || "Voluntário";
  const vacancyTitle = vacancyRes.data?.title || "Vaga";

  return (
    <main className="flex h-[calc(100vh-64px)] flex-col">
      {/* Back button (mobile) */}
      <div className="border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <Link
          href="/mensagens"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="flex-1 overflow-hidden bg-white">
        <ChatThread
          threadId={thread.id}
          otherParticipantName={otherName}
          vacancyTitle={vacancyTitle}
        />
      </div>
    </main>
  );
}
