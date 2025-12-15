import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Informe um e-mail válido." });

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  email: emailSchema,
  subject: z.string().trim().min(1, "Informe o assunto."),
  message: z.string().trim().min(1, "Informe a mensagem."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
