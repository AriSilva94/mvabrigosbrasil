import { ROUTES } from "@/constants/routes";
import { getBrowserSupabaseClient } from "@/lib/supabase/clientBrowser";

type RedirectResponse = {
  hasShelter: boolean;
  hasVolunteer?: boolean;
  hasProfile?: boolean;
  redirectTo: string;
};

async function getAccessToken(): Promise<string | null> {
  const supabase = getBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function resolvePostLoginRedirect(): Promise<string> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch("/api/auth/post-login-redirect", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Falha ao verificar destino de redirecionamento.");
    }

    const data = (await response.json()) as RedirectResponse;
    return data.redirectTo ?? (data.hasShelter ? ROUTES.panel : ROUTES.profile);
  } catch (error) {
    console.error("resolvePostLoginRedirect: erro ao decidir destino", error);
    // Fallback seguro para forçar cadastro caso haja duvida.
    return ROUTES.profile;
  }
}
