import HeroSection from "../components/home/HeroSection";
import WelcomeSection from "../components/home/WelcomeSection";
import MapSection from "../components/home/MapSection";
import BenefitsSection from "../components/home/BenefitsSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <WelcomeSection />
      <MapSection />
      <BenefitsSection />
    </main>
  );
}
