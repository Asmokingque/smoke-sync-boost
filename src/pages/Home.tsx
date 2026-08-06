/**
 * Home.tsx — HOMEPAGE
 * ---------------------------------------------------------------------------
 * This page is just a list of sections. To reorder the homepage, move the
 * lines below. To remove a section, delete or comment out its line.
 * Each section lives in src/components/home/ and controls only itself.
 * ---------------------------------------------------------------------------
 */
import { Seo } from "@/components/seo/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedSpecialSection } from "@/components/home/FeaturedSpecialSection";
import { LunchSpecialsSection } from "@/components/home/LunchSpecialsSection";
import { UpcomingHolidaysSection } from "@/components/home/UpcomingHolidaysSection";
import { SignatureFavoritesSection } from "@/components/home/SignatureFavoritesSection";
import { ServiceAreaSection } from "@/components/home/ServiceAreaSection";
import { CommunityHeroesSection } from "@/components/home/CommunityHeroesSection";
import { CateringPreviewSection } from "@/components/home/CateringPreviewSection";
import { ExperiencePreviewSection } from "@/components/home/ExperiencePreviewSection";

const Home = () => (
  <SiteLayout>
    <Seo
      title="Anderson's Smoking Que — Smoked Low. Served Bold."
      description="Authentic Southern smokehouse: slow-smoked brisket, ribs, pulled pork, wings & sides. Order online for pickup or book catering."
      path="/"
    />

    <HeroSection />
    <FeaturedSpecialSection />
    <SignatureFavoritesSection />
    <ServiceAreaSection />
    <LunchSpecialsSection />
    <UpcomingHolidaysSection />
    <CommunityHeroesSection />
    <CateringPreviewSection />
    <ExperiencePreviewSection />
  </SiteLayout>
);

export default Home;
