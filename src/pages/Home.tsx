/**
 * Home.tsx — HOMEPAGE
 * ---------------------------------------------------------------------------
 * Section order and visibility are controlled from the admin dashboard
 * (/admin/homepage). Defaults live in src/data/homepageLayout.ts.
 * Each section lives in src/components/home/ and controls only itself.
 * ---------------------------------------------------------------------------
 */
import { Seo } from "@/components/seo/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useHomepageSections } from "@/hooks/useEditableContent";
import type { HomepageSectionId } from "@/data/homepageLayout";

import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedSpecialSection } from "@/components/home/FeaturedSpecialSection";
import { LunchSpecialsSection } from "@/components/home/LunchSpecialsSection";
import { UpcomingHolidaysSection } from "@/components/home/UpcomingHolidaysSection";
import { SignatureFavoritesSection } from "@/components/home/SignatureFavoritesSection";
import { ServiceAreaSection } from "@/components/home/ServiceAreaSection";
import { CommunityHeroesSection } from "@/components/home/CommunityHeroesSection";
import { CateringPreviewSection } from "@/components/home/CateringPreviewSection";
import { ExperiencePreviewSection } from "@/components/home/ExperiencePreviewSection";

const SECTION_COMPONENTS: Record<HomepageSectionId, () => JSX.Element> = {
  hero: HeroSection,
  featuredSpecial: FeaturedSpecialSection,
  signatureFavorites: SignatureFavoritesSection,
  serviceArea: ServiceAreaSection,
  lunchSpecials: LunchSpecialsSection,
  upcomingHolidays: UpcomingHolidaysSection,
  communityHeroes: CommunityHeroesSection,
  cateringPreview: CateringPreviewSection,
  experiencePreview: ExperiencePreviewSection,
};

const Home = () => {
  const sections = useHomepageSections();

  return (
    <SiteLayout>
      <Seo
        title="Anderson's Smoking Que — Smoked Low. Served Bold."
        description="Authentic Southern smokehouse: slow-smoked brisket, ribs, pulled pork, wings & sides. Order online for pickup or book catering."
        path="/"
      />

      {sections
        .filter((s) => s.visible)
        .map((s) => {
          const Section = SECTION_COMPONENTS[s.id];
          return Section ? <Section key={s.id} /> : null;
        })}
    </SiteLayout>
  );
};

export default Home;
