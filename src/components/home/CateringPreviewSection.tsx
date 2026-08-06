/**
 * CateringPreviewSection.tsx
 * Controls: the homepage catering call-to-action (logo, headline, button).
 * Edit the copy in src/data/cateringData.ts.
 */
import { motion } from "framer-motion";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { cateringCopy } from "@/data/cateringData";
import logo from "@/assets/logo.png";

export function CateringPreviewSection() {
  return (
    <section className="container py-28 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={logo}
          alt=""
          className="h-28 w-28 mx-auto mb-6 opacity-90"
          width={112}
          height={112}
          loading="lazy"
        />
        <span className="luxury-badge mb-5">{cateringCopy.badge}</span>
        <h2 className="luxury-menu-title text-5xl md:text-6xl mb-4">{cateringCopy.title}</h2>
        <span className="luxury-gold-line mx-auto block mb-6" />
        <p className="luxury-subtitle max-w-xl mx-auto mb-10">{cateringCopy.subtitle}</p>
        <PremiumButton to="/catering">{cateringCopy.ctaLabel}</PremiumButton>
      </motion.div>
    </section>
  );
}
