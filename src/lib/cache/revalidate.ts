import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS, PROGRAM_PAGE_PATH } from "./tags";

export async function revalidateVolunteers(slug?: string) {
  revalidateTag(CACHE_TAGS.volunteers, { expire: 0 });
  if (slug) {
    revalidateTag(CACHE_TAGS.volunteer(slug), { expire: 0 });
    revalidatePath(`/voluntario/${slug}`);
  }
  revalidatePath(PROGRAM_PAGE_PATH);
}

export async function revalidateVacancies(slug?: string) {
  revalidateTag(CACHE_TAGS.vacancies, { expire: 0 });
  if (slug) {
    revalidateTag(CACHE_TAGS.vacancy(slug), { expire: 0 });
    revalidatePath(`/vaga/${slug}`);
  }
  revalidatePath(PROGRAM_PAGE_PATH);
}

export async function revalidateProgramPage() {
  revalidatePath(PROGRAM_PAGE_PATH);
}
