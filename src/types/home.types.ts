import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type CtaLink = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type WelcomeLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type MapStatisticVariant = "primary" | "secondary";

export type MapStatistic = {
  label: string;
  value: string;
  variant?: MapStatisticVariant;
};

export type BenefitItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};
