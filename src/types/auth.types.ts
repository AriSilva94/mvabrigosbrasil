// TODO: tipos para autenticação
export interface AuthUser {
  id: string;
  email?: string;
}

export type RegisterOptionVariant = "primary" | "secondary";

export interface RegisterOption {
  id: string;
  label: string;
  href: string;
  variant?: RegisterOptionVariant;
}

export interface LoginTutorialLink {
  id: string;
  label: string;
  href: string;
}
