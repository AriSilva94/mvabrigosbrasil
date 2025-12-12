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
  city?: string;
  state?: string;
  gender?: string;
  availability?: string;
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

export interface VolunteerProfileFormData {
  name: string;
  telefone: string;
  profissao: string;
  faixa_etaria: string;
  genero: string;
  escolaridade: string;
  estado: string;
  cidade: string;
  disponibilidade: string;
  periodo: string;
  experiencia: string;
  atuacao: string;
  descricao: string;
  comentarios?: string;
  acceptTerms: boolean;
  is_public?: boolean;
}
