import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import ProfileValidationProvider from "@/components/providers/ProfileValidationProvider";
import { getSession } from "@/lib/auth/session";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps): Promise<ReactNode> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ProfileValidationProvider>{children}</ProfileValidationProvider>;
}
