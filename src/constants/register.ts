import type { RegisterFormContent, RegisterType } from "@/types/auth.types";

export const REGISTER_CONTENT: Record<RegisterType, RegisterFormContent> = {
  abrigo: {
    title: "Cadastro de Abrigo",
  },
  voluntario: {
    title: "Cadastro de Voluntario",
  },
};
