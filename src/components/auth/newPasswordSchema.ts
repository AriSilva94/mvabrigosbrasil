import { z } from "zod";

// Mesmas regras da API: mínimo de 8 caracteres e no máximo os 72 bytes que o
// bcrypt de fato usa (o excedente seria ignorado sem aviso).
const MAX_PASSWORD_BYTES = 72;

export const newPasswordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .refine(
    (value) => new TextEncoder().encode(value.trim()).length <= MAX_PASSWORD_BYTES,
    "A senha deve ter no máximo 72 caracteres.",
  );
