import { buildMetadata } from "@/lib/seo";
import { enforceTeamAccess } from "@/lib/auth/teamAccess";

export const metadata = buildMetadata({
  title: "Alterar Senha",
  description: "Área para redefinir a senha da sua conta no projeto Medicina de Abrigos Brasil.",
  canonical: "/alterar-senha",
});

export default async function Page() {
  await enforceTeamAccess("/alterar-senha");
  // Página em construção para troca de senha.
  return (
    <main>
      <h1>TODO: Alterar Senha</h1>
      <p>Formulário de troca de senha em construção.</p>
    </main>
  );
}
