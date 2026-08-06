/**
 * FeaturedSpecialSection.tsx
 * Controls: "Today's Smokehouse Special" plus the four quick-link tiles.
 * Copy lives in src/data/specialsData.ts. Live special comes from the database
 * with a fallback in specialsData.ts when the backend isn't connected.
 */
import { Link } from "react-router-dom";
import { Flame, UtensilsCrossed, CalendarDays, Heart } from "lucide-react";
import { SpecialCard } from "@/components/specials/SpecialCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { useSpecials } from "@/hooks/useSpecials";
import { isVisibleNow } from "@/lib/specials";
import { specialsCopy } from "@/data/specialsData";
import { useSiteContent } from "@/hooks/useEditableContent";

const quickLinks = [
  { to: "/specials", label: "Today's Special", icon: Flame },
  { to: "/specials", label: "Lunch Specials", icon: UtensilsCrossed },
  { to: "/holiday-calendar", label: "Holiday Calendar", icon: CalendarDays },
  { to: "/specials", label: "Heroes Deal", icon: Heart },
];

export function FeaturedSpecialSection() {
  const { specials } = useSpecials({ activeOnly: true });
  const todaysSpecial = specials.find((s) => s.type === "daily" && isVisibleNow(s));

  return (
    <section className="container py-20 md:py-24">
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
        <div>
          <SectionHeader
            align="left"
            badge={specialsCopy.dailyBadge}
            badgeIcon={Flame}
            title={specialsCopy.dailyTitle}
            subtitle={specialsCopy.dailySubtitle}
            className="mb-6"
          />
          {todaysSpecial ? (
            <SpecialCard special={todaysSpecial} variant="hero" />
          ) : (
            <div className="luxury-card p-8 text-center">
              <p className="luxury-subtitle mb-4">{specialsCopy.dailyEmptyText}</p>
              <PremiumButton variant="small" to="/menu">
                {siteContent.callToAction.viewMenu}
              </PremiumButton>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="luxury-card p-5 flex flex-col items-start gap-3 hover:-translate-y-1 transition-transform"
            >
              <q.icon className="h-6 w-6 text-gold" />
              <span className="font-stencil text-xs tracking-widest text-foreground">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
