import { z } from "zod";

export const changePasswordSchema = z
  .object({
    // Contas vindas do WordPress podem ter senha atual com menos de 6 caracteres.
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "As senhas precisam coincidir.",
  });
