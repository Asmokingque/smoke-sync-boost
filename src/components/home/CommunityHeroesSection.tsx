/**
 * CommunityHeroesSection.tsx
 * Controls: the "Community Heroes" discount band (military, first responders,
 * teachers, seniors). Edit the groups and wording below.
 */
import { Heart, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PremiumCard } from "@/components/shared/PremiumCard";
import { PremiumButton } from "@/components/shared/PremiumButton";

const heroesCopy = {
  badge: "Community Heroes",
  title: "We Take Care of Our Own",
  subtitle:
    "A thank-you discount for the people who keep our community running. Select your group at checkout and show valid ID at pickup.",
  ctaLabel: "See Heroes Deal",
};

const groups = [
  "Active Military",
  "Veterans",
  "First Responders",
  "Teachers",
  "Healthcare Workers",
  "Seniors 65+",
];

export function CommunityHeroesSection() {
  return (
    <section className="container py-20">
      <SectionHeader
        badge={heroesCopy.badge}
        badgeIcon={Heart}
        title={heroesCopy.title}
        subtitle={heroesCopy.subtitle}
      />
      <PremiumCard className="max-w-4xl mx-auto text-center">
        <ShieldCheck className="h-10 w-10 text-gold mx-auto mb-5" />
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {groups.map((g) => (
            <span
              key={g}
              className="rounded-full border border-border px-4 py-2 font-stencil text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              {g}
            </span>
          ))}
        </div>
        <PremiumButton to="/specials">{heroesCopy.ctaLabel}</PremiumButton>
      </PremiumCard>
    </section>
  );
}
