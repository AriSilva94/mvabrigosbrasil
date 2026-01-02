/**
 * Cache Tags para Next.js 16
 *
 * Sistema de tags para invalidação seletiva de cache
 */

export const CACHE_TAGS = {
  // Dados públicos
  VOLUNTEERS_PUBLIC: 'volunteers-public',
  VACANCIES_PUBLIC: 'vacancies-public',
  DATABASE_DATASET: 'database-dataset',

  // Dados por entidade (funções)
  VOLUNTEER: (slug: string) => `volunteer-${slug}`,
  VACANCY: (slug: string) => `vacancy-${slug}`,

  // Dados protegidos por usuário/abrigo
  VACANCIES_SHELTER: (shelterId: string) => `vacancies-shelter-${shelterId}`,
  DYNAMICS: (shelterId: string) => `dynamics-${shelterId}`,
  SHELTER_PROFILE: (userId: string) => `shelter-profile-${userId}`,
  VOLUNTEER_PROFILE: (userId: string) => `volunteer-profile-${userId}`,
  TEAM_USERS: (shelterId: string) => `team-users-${shelterId}`,

  // Páginas estáticas
  PAGE_INSTITUTIONAL: 'page-institutional',
  PAGE_LEGAL: 'page-legal',
} as const;

export const CACHE_TIMES = {
  VERY_LONG: 60 * 60 * 6, // 6 horas (21600s)
  LONG: 60 * 30, // 30 minutos (1800s)
  MEDIUM: 60 * 15, // 15 minutos (900s)
  SHORT: 60 * 10, // 10 minutos (600s)
  VERY_SHORT: 60 * 5, // 5 minutos (300s)
} as const;
