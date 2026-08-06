/**
 * LunchSpecialsSection.tsx
 * Controls: the homepage "Lunch Specials" grid (Mon–Fri midday deals).
 * Hidden automatically when there are no active lunch specials.
 */
import { Sparkles } from "lucide-react";
import { SpecialCard } from "@/components/specials/SpecialCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { useSpecials } from "@/hooks/useSpecials";
import { isVisibleNow } from "@/lib/specials";
import { specialsCopy } from "@/data/specialsData";
import { siteContent } from "@/data/siteContent";

export function LunchSpecialsSection() {
  const { specials } = useSpecials({ activeOnly: true });
  const lunchSpecials = specials.filter((s) => s.type === "lunch" && isVisibleNow(s)).slice(0, 3);

  if (lunchSpecials.length === 0) return null;

  return (
    <section className="container py-20">
      <SectionHeader
        badge={specialsCopy.lunchBadge}
        badgeIcon={Sparkles}
        title={specialsCopy.lunchTitle}
        subtitle={specialsCopy.lunchSubtitle}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lunchSpecials.map((s, i) => (
          <SpecialCard key={s.id} special={s} index={i} />
        ))}
      </div>
      <div className="text-center mt-10">
        <PremiumButton variant="small" to="/specials">
          {siteContent.callToAction.viewAllSpecials}
        </PremiumButton>
      </div>
    </section>
  );
}
