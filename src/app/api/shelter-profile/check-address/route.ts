import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { unformatDigits } from "@/lib/formatters";

type CurrentUser = { id: string; email: string | null };

async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}


export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cep = searchParams.get('cep');
    const street = searchParams.get('street');
    const number = searchParams.get('number');

    if (!cep) {
      return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();


    const cepDigits = unformatDigits(cep);


    let query = supabaseAdmin
      .from("shelters")
      .select("id, profile_id, name, cep, street, number, city, state, active")
      .eq("cep", cepDigits)
      .eq("active", true);


    if (street && number) {
      query = query
        .ilike("street", street.trim())
        .eq("number", parseInt(number, 10));
    }

    const { data, error } = await query;

    if (error) {
      console.error("check-address GET: erro ao consultar shelters", error);
      return NextResponse.json({ error: "Erro ao verificar endereço" }, { status: 500 });
    }


    const otherShelters = data?.filter((shelter) => shelter.profile_id !== user.id) || [];

    if (otherShelters.length > 0) {
      return NextResponse.json({
        exists: true,
        count: otherShelters.length,
        shelters: otherShelters.map((s) => ({
          name: s.name,
          street: s.street,
          number: s.number,
          city: s.city,
          state: s.state,
        })),
      });
    }

    return NextResponse.json({
      exists: false,
      count: 0,
      shelters: [],
    });
  } catch (error) {
    console.error("check-address GET: erro inesperado", error);
    return NextResponse.json({ error: "Erro ao verificar endereço" }, { status: 500 });
  }
}
