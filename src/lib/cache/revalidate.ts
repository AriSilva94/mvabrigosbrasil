/**
 * Funções de Invalidação de Cache
 *
 * Funções helper para invalidar tags de cache após mutations
 * Next.js 16+ requer segundo parâmetro com opções
 */

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './tags';

/**
 * Invalidar lista pública de voluntários
 * Usar após: criar, editar, deletar voluntário
 */
export function invalidateVolunteersPublic() {
  revalidateTag(CACHE_TAGS.VOLUNTEERS_PUBLIC, 'max');
}

/**
 * Invalidar perfil individual de voluntário
 * Usar após: editar voluntário
 */
export function invalidateVolunteer(slug: string) {
  revalidateTag(CACHE_TAGS.VOLUNTEER(slug), 'max');
}

/**
 * Invalidar lista pública de vagas
 * Usar após: criar, editar, deletar vaga pública
 */
export function invalidateVacanciesPublic() {
  revalidateTag(CACHE_TAGS.VACANCIES_PUBLIC, 'max');
}

/**
 * Invalidar perfil individual de vaga
 * Usar após: editar, deletar vaga
 */
export function invalidateVacancy(slug: string) {
  revalidateTag(CACHE_TAGS.VACANCY(slug), 'max');
}

/**
 * Invalidar lista de vagas de um abrigo específico
 * Usar após: criar, editar, deletar vaga do abrigo
 */
export function invalidateVacanciesShelter(shelterId: string) {
  revalidateTag(CACHE_TAGS.VACANCIES_SHELTER(shelterId), 'max');
}

/**
 * Invalidar dataset completo do banco de dados
 * Usar após: criar, deletar dinâmica populacional
 */
export function invalidateDatabaseDataset() {
  revalidateTag(CACHE_TAGS.DATABASE_DATASET, 'max');
}

/**
 * Invalidar lista de dinâmicas de um abrigo
 * Usar após: criar, deletar dinâmica populacional
 */
export function invalidateDynamics(shelterId: string) {
  revalidateTag(CACHE_TAGS.DYNAMICS(shelterId), 'max');
}

/**
 * Invalidar perfil de abrigo
 * Usar após: editar perfil do abrigo
 */
export function invalidateShelterProfile(userId: string) {
  revalidateTag(CACHE_TAGS.SHELTER_PROFILE(userId), 'max');
}

/**
 * Invalidar perfil de voluntário autenticado
 * Usar após: editar perfil do voluntário
 */
export function invalidateVolunteerProfile(userId: string) {
  revalidateTag(CACHE_TAGS.VOLUNTEER_PROFILE(userId), 'max');
}

/**
 * Invalidar lista de usuários de equipe
 * Usar após: adicionar, editar, ativar/desativar usuário de equipe
 */
export function invalidateTeamUsers(shelterId: string) {
  revalidateTag(CACHE_TAGS.TEAM_USERS(shelterId), 'max');
}
