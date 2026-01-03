// Types for vacancy applications (volunteer candidatures)

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type VacancyApplication = {
  id: string;
  vacancyId: string;
  volunteerId: string;
  status: ApplicationStatus;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type VacancyApplicationWithVolunteer = VacancyApplication & {
  volunteer: {
    id: string;
    name: string;
    cidade?: string;
    estado?: string;
    telefone?: string;
    profissao?: string;
    experiencia?: string;
    slug: string;
  };
};

export type ApplicationCount = {
  vacancyId: string;
  count: number;
};
