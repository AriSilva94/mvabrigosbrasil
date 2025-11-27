import type { LucideIcon } from "lucide-react";

export type ProjectLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type FounderSocialType = "instagram" | "lattes";

export type FounderSocial = {
  type: FounderSocialType;
  href: string;
  label: string;
};

export type Founder = {
  name: string;
  role: string;
  description: string;
  image: string;
  alt: string;
  socials: FounderSocial[];
};
