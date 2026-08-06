/**
 * CateringPackages.tsx
 * Controls: the catering package tiers grid.
 * Edit the packages (name, guest count, price, what's included) in
 * src/data/cateringData.ts — no code changes needed.
 */
import { Check } from "lucide-react";
import { PremiumCard } from "@/components/shared/PremiumCard";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cateringPackages } from "@/data/cateringData";

export function CateringPackages() {
  return (
    <section className="container py-20">
      <SectionHeader
        badge="Packages"
        title="Choose Your Spread"
        subtitle="Every package is built to order — mix meats, sides and service level to fit your event."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {cateringPackages.map((pkg) => (
          <PremiumCard
            key={pkg.id}
            className={`flex flex-col ${pkg.highlight ? "ring-1 ring-gold/40" : ""}`}
          >
            <h3 className="luxury-menu-title text-3xl mb-1">{pkg.name}</h3>
            <span className="font-stencil text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              {pkg.guests}
            </span>
            <div className="luxury-price text-2xl mb-4">
              {pkg.pricePerPerson}
              <span className="text-xs text-muted-foreground"> / person</span>
            </div>
            <span className="luxury-divider mb-4" />
            <ul className="space-y-2 flex-1 mb-6">
              {pkg.includes.map((inc) => (
                <li key={inc} className="flex items-start gap-2 luxury-subtitle text-sm">
                  <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {inc}
                </li>
              ))}
            </ul>
            <PremiumButton variant="small" to="/catering" fullWidth>
              Request This Package
            </PremiumButton>
          </PremiumCard>
        ))}
      </div>
    </section>
  );
}
