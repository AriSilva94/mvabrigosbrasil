import { z } from "zod";
import { unformatDigits } from "@/lib/formatters";

export const shelterProfileSchema = z.object({
  shelterType: z.string().min(1, "Selecione o tipo de abrigo."),
  cnpj: z.string().min(1, "Informe o documento."),
  shelterName: z.string().min(1, "Informe o nome do abrigo."),
  cep: z.string().min(1, "Informe o CEP."),
  street: z.string().min(1, "Informe a rua."),
  number: z.coerce.number().min(0, "Informe o número."),
  district: z.string().min(1, "Informe o bairro."),
  state: z.string().min(1, "Selecione o estado."),
  city: z.string().min(1, "Informe a cidade."),
  website: z.string().optional(),
  foundationDate: z.string().min(1, "Informe a fundação do abrigo."),
  species: z.string().min(1, "Informe a espécie principal."),
  additionalSpecies: z.array(z.string()).optional(),
  temporaryAgreement: z.string().optional(),
  referralSource: z.string().min(1, "Selecione como conheceu o projeto."),
  initialDogs: z.coerce.number().min(0, "Informe a população inicial de cães."),
  initialCats: z.coerce.number().min(0, "Informe a população inicial de gatos."),
  authorizedName: z.string().min(1, "Informe o nome do responsável."),
  authorizedRole: z.string().min(1, "Selecione o cargo."),
  authorizedEmail: z.string().email("Informe um e-mail válido."),
  authorizedPhone: z.string().min(1, "Informe o telefone."),
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, { message: "Você deve aceitar os termos." }),
}).superRefine((data, ctx) => {
  // Validação CNPJ/CPF - remove formatação
  const cnpjDigits = unformatDigits(data.cnpj);
  const isTemporary = data.shelterType === "temporary";

  if (isTemporary) {
    if (cnpjDigits.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um CPF válido (11 dígitos).",
        path: ["cnpj"],
      });
    }
  } else {
    if (cnpjDigits.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um CNPJ válido (14 dígitos).",
        path: ["cnpj"],
      });
    }
  }

  // Validação telefone - remove formatação
  const phoneDigits = unformatDigits(data.authorizedPhone);
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe um telefone válido (10 ou 11 dígitos).",
      path: ["authorizedPhone"],
    });
  }
});

export type ShelterProfileInput = z.infer<typeof shelterProfileSchema>;

export function mapShelterProfileToDb(
  profileId: string,
  payload: ShelterProfileInput,
) {
  // Remove formatação dos campos
  const documentDigits = unformatDigits(payload.cnpj);
  const cepDigits = unformatDigits(payload.cep);
  const phoneDigits = unformatDigits(payload.authorizedPhone);
  const isTemporary = payload.shelterType === "temporary";

  return {
    profile_id: profileId,
    shelter_type: payload.shelterType,
    cnpj: isTemporary ? null : documentDigits,
    cpf: isTemporary ? documentDigits : null,
    name: payload.shelterName,
    cep: cepDigits,
    street: payload.street,
    number: payload.number,
    district: payload.district,
    state: payload.state,
    city: payload.city,
    website: payload.website,
    foundation_date: payload.foundationDate,
    species: payload.species,
    additional_species: payload.additionalSpecies ?? [],
    temporary_agreement: payload.temporaryAgreement ?? null,
    referral_source: payload.referralSource,
    initial_dogs: payload.initialDogs,
    initial_cats: payload.initialCats,
    authorized_name: payload.authorizedName,
    authorized_role: payload.authorizedRole,
    authorized_email: payload.authorizedEmail,
    authorized_phone: phoneDigits,
    accept_terms: payload.acceptTerms,
  };
}
