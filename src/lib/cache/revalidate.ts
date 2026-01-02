/**
 * Funções de Invalidação de Cache
 *
 * Funções helper para invalidar rotas após mutations
 * Usando revalidatePath para forçar atualização mesmo em navegação client-side
 */

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";

/**
 * Invalidar lista pública de voluntários
 * Usar após: criar, editar, deletar voluntário
 */
export function invalidateVolunteersPublic() {
  revalidateTag(CACHE_TAGS.volunteersPublic, "max");
  revalidatePath("/programa-de-voluntarios");
}

/**
 * Invalidar perfil individual de voluntário
 * Usar após: editar voluntário
 */
export function invalidateVolunteer(slug: string) {
  revalidateTag(CACHE_TAGS.volunteersPublic, "max");
  revalidatePath(`/voluntario/${slug}`);
  revalidatePath("/programa-de-voluntarios");
}

/**
 * Invalidar lista pública de vagas
 * Usar após: criar, editar, deletar vaga pública
 */
export function invalidateVacanciesPublic() {
  revalidateTag(CACHE_TAGS.vacanciesPublic, "max");
  revalidatePath("/programa-de-voluntarios");
}

/**
 * Invalidar perfil individual de vaga
 * Usar após: editar, deletar vaga
 */
export function invalidateVacancy(slug: string) {
  revalidatePath(`/vaga/${slug}`);
}

/**
 * Invalidar lista de vagas de um abrigo específico
 * Usar após: criar, editar, deletar vaga do abrigo
 */
export function invalidateVacanciesShelter() {
  revalidatePath('/minhas-vagas');
}

/**
 * Invalidar dataset completo do banco de dados
 * Usar após: criar, deletar dinâmica populacional
 */
export function invalidateDatabaseDataset() {
  revalidateTag(CACHE_TAGS.databaseDataset, "max");
  revalidatePath("/banco-de-dados");
}

/**
 * Invalidar lista de dinâmicas de um abrigo
 * Usar após: criar, deletar dinâmica populacional
 */
export function invalidateDynamics() {
  revalidatePath('/dinamica-populacional');
}

/**
 * Invalidar perfil de abrigo
 * Usar após: editar perfil do abrigo
 */
export function invalidateShelterProfile() {
  revalidatePath('/meu-cadastro');
}

/**
 * Invalidar perfil de voluntário autenticado
 * Usar após: editar perfil do voluntário
 */
export function invalidateVolunteerProfile() {
  revalidateTag(CACHE_TAGS.volunteersPublic, "max");
  revalidatePath("/programa-de-voluntarios");
  revalidatePath('/meu-cadastro');
}

/**
 * Invalidar lista de usuários de equipe
 * Usar após: adicionar, editar, ativar/desativar usuário de equipe
 */
export function invalidateTeamUsers() {
  revalidatePath('/equipe');
}
