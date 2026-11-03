import { z } from "zod";

import { newPasswordSchema } from "./newPasswordSchema";

export const changePasswordSchema = z
  .object({
    // Contas vindas do WordPress podem ter senha atual curta.
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: newPasswordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "As senhas precisam coincidir.",
  });
