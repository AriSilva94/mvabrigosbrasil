import type { VolunteerTabId } from "@/types/volunteer.types";

export const VOLUNTEER_TAB_IDS = {
  VOLUNTEERS: "volunteers" as VolunteerTabId,
  VAGAS: "vagas" as VolunteerTabId,
  FAQ: "faq" as VolunteerTabId,
};

export const VOLUNTEER_TABS: { id: VolunteerTabId; label: string }[] = [
  { id: VOLUNTEER_TAB_IDS.VOLUNTEERS, label: "Voluntários Disponíveis" },
  { id: VOLUNTEER_TAB_IDS.VAGAS, label: "Vagas" },
  { id: VOLUNTEER_TAB_IDS.FAQ, label: "Perguntas Frequentes" },
];
