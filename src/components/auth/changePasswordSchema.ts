import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "A senha atual deve ter pelo menos 6 caracteres."),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "As senhas precisam coincidir.",
  });
