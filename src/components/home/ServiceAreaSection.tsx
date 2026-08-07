/**
 * ServiceAreaSection.tsx
 * Controls: the "Where We Serve" band — city chips, delivery details, footnote.
 * Copy is edited live at /admin/service-area (defaults: src/data/serviceAreaData.ts).
 */
import { MapPin } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PremiumCard } from "@/components/shared/PremiumCard";
import { useServiceArea } from "@/hooks/useEditableContent";

export function ServiceAreaSection() {
  const serviceArea = useServiceArea();

  return (
    <section className="container py-20">
      <SectionHeader
        badge={serviceArea.badge}
        badgeIcon={MapPin}
        title={serviceArea.title}
        subtitle={serviceArea.subtitle}
      />

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {(serviceArea.cities ?? []).map((city) => (
          <span
            key={city}
            className="rounded-full border border-gold/30 px-5 py-2 font-stencil text-xs uppercase tracking-widest text-foreground"
          >
            {city}
          </span>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {(serviceArea.details ?? []).map((d) => (
          <PremiumCard key={d.label} size="compact" className="text-center">
            <div className="font-stencil text-[10px] uppercase tracking-widest text-gold mb-2">
              {d.label}
            </div>
            <div className="luxury-menu-title text-2xl">{d.value}</div>
          </PremiumCard>
        ))}
      </div>

      <p className="luxury-subtitle text-sm text-center mt-8">{serviceArea.footnote}</p>
    </section>
  );
}
