import { REGISTER_TYPES } from "@/constants/registerTypes";
import type { RegisterFormContent, RegisterType } from "@/types/auth.types";

export const REGISTER_CONTENT: Record<RegisterType, RegisterFormContent> = {
  [REGISTER_TYPES.shelter]: {
    title: "Cadastro de Abrigo",
  },
  [REGISTER_TYPES.volunteer]: {
    title: "Cadastro de Voluntario",
  },
  [REGISTER_TYPES.manager]: {
    title: "Cadastro de Gerente",
  },
};
