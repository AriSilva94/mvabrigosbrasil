import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

async function getUserId(): Promise<string | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Verifica se existe cadastro
    const { data: shelter, error: selectError } = await supabaseAdmin
      .from("shelters")
      .select("id, active")
      .eq("profile_id", userId)
      .maybeSingle();

    if (selectError) {
      console.error("deactivate: erro ao buscar shelter", selectError);
      return NextResponse.json({ error: "Erro ao buscar cadastro" }, { status: 500 });
    }

    if (!shelter) {
      return NextResponse.json({ error: "Cadastro não encontrado" }, { status: 404 });
    }

    // Alterna status (toggle)
    const newStatus = !shelter.active;

    const { error: updateError } = await supabaseAdmin
      .from("shelters")
      .update({ active: newStatus })
      .eq("profile_id", userId);

    if (updateError) {
      const isStringTooLong = updateError.code === "22001";
      if (isStringTooLong) {
        console.error(
          "deactivate: erro de tamanho em campo (possivelmente operation/status no histórico). Ajuste o schema para caber STATUS_CHANGE ou aumente o tamanho da coluna.",
          updateError,
        );
        return NextResponse.json(
          {
            error:
              "Erro ao registrar histórico de status. Ajuste o schema (campo curto demais) e tente novamente.",
          },
          { status: 500 },
        );
      }

      console.error("deactivate: erro ao atualizar", updateError);
      return NextResponse.json({ error: "Erro ao atualizar cadastro" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      active: newStatus,
      message: newStatus
        ? "Cadastro reativado com sucesso"
        : "Cadastro inativado com sucesso",
    });
  } catch (error) {
    console.error("deactivate: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 });
  }
}
