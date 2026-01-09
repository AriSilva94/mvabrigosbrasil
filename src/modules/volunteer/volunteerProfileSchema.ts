import { z } from "zod";
import { unformatDigits } from "@/lib/formatters";

export const volunteerProfileSchema = z
  .object({
    name: z.string().min(1, "Informe o nome social completo."),
    telefone: z.string().min(1, "Informe o telefone."),
    profissao: z.string().min(1, "Informe a profissão."),
    faixa_etaria: z.string().min(1, "Selecione a faixa etária."),
    genero: z.string().min(1, "Selecione o gênero."),
    escolaridade: z.string().min(1, "Selecione a escolaridade."),
    estado: z.string().min(1, "Informe o estado."),
    cidade: z.string().min(1, "Informe a cidade."),
    disponibilidade: z.string().min(1, "Selecione a disponibilidade de tempo."),
    periodo: z.string().min(1, "Selecione a disponibilidade de período."),
    experiencia: z.string().min(1, "Informe se tem experiência."),
    atuacao: z.string().min(1, "Selecione a forma de atuação."),
    descricao: z.string().min(1, "Descreva suas habilidades."),
    comentarios: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine((value) => value === true, { message: "Você deve aceitar os termos." }),
  })
  .superRefine((data, ctx) => {
    // Validação telefone - remove formatação
    const phoneDigits = unformatDigits(data.telefone);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um telefone válido (10 ou 11 dígitos).",
        path: ["telefone"],
      });
    }

    // Validação profissão - não permitir apenas números
    const profissaoOnlyNumbers = /^\d+$/.test(data.profissao.trim());
    if (profissaoOnlyNumbers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A profissão não pode conter apenas números.",
        path: ["profissao"],
      });
    }
  });

export type VolunteerProfileInput = z.infer<typeof volunteerProfileSchema>;

export function mapVolunteerProfileToDb(
  profileId: string,
  payload: VolunteerProfileInput,
) {
  // Remove formatação do telefone
  const phoneDigits = unformatDigits(payload.telefone);

  return {
    owner_profile_id: profileId,
    name: payload.name,
    telefone: phoneDigits,
    profissao: payload.profissao,
    faixa_etaria: payload.faixa_etaria,
    genero: payload.genero,
    escolaridade: payload.escolaridade,
    estado: payload.estado,
    cidade: payload.cidade,
    disponibilidade: payload.disponibilidade,
    periodo: payload.periodo,
    experiencia: payload.experiencia,
    atuacao: payload.atuacao,
    descricao: payload.descricao,
    comentarios: payload.comentarios ?? null,
    accept_terms: payload.acceptTerms,
    // Novo fluxo: perfis cadastrados são públicos por padrão.
    is_public: true,
  };
}
