/**
 * HeroSection.tsx
 * Controls: the big homepage hero — background photo, headline, tagline,
 * description and the three main call-to-action buttons.
 * Edit the WORDS in src/data/siteContent.ts. Edit the LAYOUT here.
 */
import { motion } from "framer-motion";
import { Flame, ChevronRight, Plus, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { SmokeBackground } from "@/components/ui/SmokeBackground";
import { useSiteContent } from "@/hooks/useEditableContent";
import hero from "@/assets/hero-bbq.jpg";

export function HeroSection() {
  const c = siteContent;
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={hero}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/85 to-background" />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[42rem] w-[42rem] rounded-full bg-primary/25 blur-[140px]"
        />
      </div>
      <SmokeBackground density="lg" />

      <div className="relative container py-36 md:py-52 lg:py-64 min-h-[88vh] flex items-center">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="luxury-eyebrow mb-6 inline-flex items-center gap-2">
              <Flame className="h-3 w-3" />
              <span>{c.heroEyebrow}</span>
            </div>

            <h1 className="luxury-hero-title text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] mb-2">
              {c.heroTitle}
              <br />
              <span className="italic text-gradient-ember">{c.heroTitleAccent}</span>
            </h1>

            <div className="flex items-center gap-4 mt-8 mb-6">
              <span className="luxury-gold-line" />
              <p className="font-stencil text-sm md:text-base text-gold tracking-[0.32em]">
                {c.heroSubtitle}
              </p>
              <span className="luxury-gold-line" />
            </div>

            <p className="luxury-subtitle max-w-xl mb-12">{c.heroDescription}</p>

            <div className="flex flex-wrap gap-3">
              <Link to="/menu">
                <button className="luxury-primary-btn h-14 px-8 font-stencil text-sm tracking-widest inline-flex items-center gap-2">
                  <Plus className="h-5 w-5" /> {c.callToAction.startOrder}
                </button>
              </Link>
              <Link to="/menu">
                <button className="luxury-secondary-btn h-14 px-8 font-stencil text-sm tracking-widest inline-flex items-center gap-2">
                  {c.callToAction.viewMenu} <ChevronRight className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/catering">
                <button className="luxury-secondary-btn h-14 px-8 font-stencil text-sm tracking-widest">
                  {c.callToAction.requestCatering}
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Featured favorite card (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="hidden lg:block"
          >
            <div className="luxury-card p-8">
              <div className="flex items-center justify-between mb-5">
                <span className="luxury-badge inline-flex items-center gap-1">
                  <Award className="h-3 w-3" /> {c.heroFeatured.badge}
                </span>
                <span className="luxury-price font-serif text-xl">{c.heroFeatured.price}</span>
              </div>
              <h3 className="luxury-menu-title text-3xl mb-3 leading-tight">
                {c.heroFeatured.title}
              </h3>
              <p className="luxury-subtitle text-sm mb-6">
                {c.heroFeatured.description}
              </p>
              <div className="luxury-divider mb-6" />
              <Link to="/menu" className="block">
                <button className="luxury-primary-btn w-full h-12 font-stencil text-sm tracking-widest inline-flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> {c.callToAction.addToOrder}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
