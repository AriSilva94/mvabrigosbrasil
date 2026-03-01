import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/clientServer";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase-admin";

export async function GET() {
  const supabase = await getServerSupabaseClient({ readOnly: true });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ count: 0 });
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { data, error } = await supabaseAdmin.rpc("get_chat_total_unread_count", {
    p_profile_id: user.id,
  });

  if (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: data || 0 });
}
