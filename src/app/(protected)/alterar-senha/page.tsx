import { redirect } from "next/navigation";

// Funcionalidade temporariamente desabilitada - serviço de email indisponível
export default async function Page(): Promise<never> {
  redirect("/painel");
}
