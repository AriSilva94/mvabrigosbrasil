import type { ChatThreadWithMeta, CurrentThread } from "@/types/chat.types";

// Os botões de entrada só sabem o id da conversa; nome, vaga e presença vêm
// da caixa de entrada.
export function resolveCurrentThread(
  threads: ChatThreadWithMeta[],
  threadId: string,
  userId: string,
): CurrentThread | null {
  const thread = threads.find((item) => item.id === threadId);
  if (!thread) return null;

  return {
    id: thread.id,
    otherName: thread.other_participant_name,
    otherProfileId:
      thread.volunteer_profile_id === userId ? thread.shelter_profile_id : thread.volunteer_profile_id,
    vacancyTitle: thread.vacancy_title,
  };
}
