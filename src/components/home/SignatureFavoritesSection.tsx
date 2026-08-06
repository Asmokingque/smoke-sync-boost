/**
 * SignatureFavoritesSection.tsx
 * Controls: the "Pitmaster Picks" three-card highlight grid plus the
 * "Wood-Fired / Made Daily / Catering Ready" trust row.
 * Edit the arrays below to change which dishes are highlighted.
 */
import { motion } from "framer-motion";
import { Award, Flame, Clock } from "lucide-react";
import { PremiumCard } from "@/components/shared/PremiumCard";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { useSiteContent } from "@/hooks/useEditableContent";

/** Icon lookup — copy lives in src/data/siteContent.ts */
const icons = { flame: Flame, clock: Clock, award: Award } as const;

const highlights = siteContent.highlights.map((h) => ({
  ...h,
  icon: icons[h.icon as keyof typeof icons] ?? Flame,
}));

const favorites = siteContent.favorites;

export function SignatureFavoritesSection() {
  return (
    <>
      <section className="container py-24 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {highlights.map((f) => (
            <PremiumCard key={f.title}>
              <f.icon className="h-9 w-9 text-gold mb-4" />
              <h3 className="luxury-menu-title text-3xl mb-2">{f.title}</h3>
              <span className="luxury-gold-line block mb-4" />
              <p className="luxury-subtitle text-base">{f.body}</p>
            </PremiumCard>
          ))}
        </motion.div>
      </section>

      <section className="container py-24 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="luxury-badge mb-5 inline-flex items-center gap-2">
            <Award className="h-3 w-3" /> Pitmaster Picks
          </span>
          <h2 className="luxury-category-title text-sm mb-4">Signature Favorites</h2>
          <h3 className="luxury-menu-title text-5xl md:text-6xl mb-5">The Bold &amp; The Smoky</h3>
          <span className="luxury-gold-line mx-auto block mb-5" />
          <p className="luxury-subtitle max-w-2xl mx-auto">
            The dishes our regulars come back for — slow-smoked, hand-built, and worth the wait.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {favorites.map((s) => (
            <PremiumCard key={s.name} className="flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h4 className="luxury-menu-title text-2xl leading-tight">{s.name}</h4>
                <span className="luxury-price text-sm">{s.price}</span>
              </div>
              <span className="luxury-divider mb-4" />
              <p className="luxury-subtitle text-sm flex-1 mb-6">{s.desc}</p>
              <PremiumButton variant="small" to="/menu" fullWidth>
                View on Menu
              </PremiumButton>
            </PremiumCard>
          ))}
        </div>

        <div className="text-center mt-12">
          <PremiumButton to="/menu">{siteContent.callToAction.viewFullMenu}</PremiumButton>
        </div>
      </section>
    </>
  );
}
