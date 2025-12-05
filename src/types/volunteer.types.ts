export type Volunteer = {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
};

export type VolunteerCard = {
  id: string;
  name: string;
  slug: string;
  location?: string;
};

export type VolunteerTabId = "volunteers" | "vacancies" | "faq";

export type VolunteerProfile = {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  profession?: string;
  schooling?: string;
  experience?: string;
  availability?: string;
  skills?: string;
  period?: string;
  notes?: string;
};

export type VolunteerFaq = {
  id: string;
  question: string;
  answer: React.ReactNode;
};
