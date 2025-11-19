import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      {/* TODO: adicionar Header/Footer globais */}
      {children}
    </div>
  );
}
