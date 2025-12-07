import type { JSX } from "react";
import Link from "next/link";

export default function RegisterActionLinks(): JSX.Element {
  return (
    <div className="flex flex-col space-y-2 text-center">
      <Link
        href="/login"
        className="text-sm font-semibold text-[#6b7280] hover:text-brand-primary"
      >
        Acessar
      </Link>
      <Link
        href="/alterar-senha"
        className="text-sm font-semibold text-brand-primary hover:underline"
      >
        Perdeu a senha?
      </Link>
    </div>
  );
}
