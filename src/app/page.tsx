import type { JSX } from "react";

import BenefitsSection from "@/components/home/BenefitsSection";
import HeroSection from "@/components/home/HeroSection";
import MapSection from "@/components/home/MapSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WelcomeSection from "@/components/home/WelcomeSection";

export default function HomePage(): JSX.Element {
  return (
    <main>
      <HeroSection />
      <WelcomeSection />
      <MapSection />
      <BenefitsSection />
      <TestimonialsSection />
    </main>
  );
}
