import type { LoginTutorialLink, RegisterOption } from "@/types/auth.types";

export const REGISTER_OPTIONS: RegisterOption[] = [
  {
    id: "shelter",
    label: "Cadastro Abrigo",
    href: "/register?tipo=abrigo",
    variant: "secondary",
  },
  {
    id: "volunteer",
    label: "Cadastro Voluntário",
    href: "/register?tipo=voluntario",
    variant: "primary",
  },
];

export const LOGIN_TUTORIALS: LoginTutorialLink[] = [
  {
    id: "shelter-tutorial",
    label: "Tutorial Cadastro de Abrigo",
    href: "https://youtu.be/c1_rAzP7ARo",
  },
  {
    id: "volunteer-tutorial",
    label: "Tutorial Cadastro de Voluntário",
    href: "https://youtu.be/epVvIj6Z-gI",
  },
];
