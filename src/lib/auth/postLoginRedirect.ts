import { ROUTES } from "@/constants/routes";
import { apiClient } from "@/lib/api/client";

type RedirectResponse = {
  hasShelter: boolean;
  hasVolunteer?: boolean;
  hasProfile?: boolean;
  redirectTo: "/painel" | "/meu-cadastro";
};

export async function resolvePostLoginRedirect(): Promise<string> {
  try {
    const data = await apiClient<RedirectResponse>(
      "/auth/post-login-redirect",
    );
    return data.redirectTo ?? (data.hasShelter ? ROUTES.panel : ROUTES.profile);
  } catch (error) {
    console.error("resolvePostLoginRedirect: erro ao decidir destino", error);
    return ROUTES.profile;
  }
}
