import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getServerSupabaseClient } from "@/lib/supabase/clientServer";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps): Promise<ReactNode> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
