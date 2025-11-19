import type { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div>
      {/* TODO: validar autenticação e fornecer layout protegido */}
      {children}
    </div>
  );
}
