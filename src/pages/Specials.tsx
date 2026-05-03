import { useMemo } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SpecialCard } from "@/components/specials/SpecialCard";
import { useSpecials } from "@/hooks/useSpecials";
import { isVisibleNow, type Special } from "@/lib/specials";
import { Flame, Sparkles, Loader2, Calendar as CalendarIcon, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Specials = () => {
  const { specials, loading } = useSpecials({ activeOnly: true });

  const groups = useMemo(() => {
    const visible = specials.filter((s) => isVisibleNow(s));
    return {
      today: visible.filter((s) => s.type === "daily"),
      lunch: visible.filter((s) => s.type === "lunch"),
      holiday: visible.filter((s) => s.type === "holiday"),
      featured: visible.filter((s) => s.type === "featured"),
      upcoming: specials.filter((s) => !isVisibleNow(s) && s.is_active && s.available_from),
    };
  }, [specials]);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative border-b border-gold/20 overflow-hidden">
        <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 h-[24rem] w-[40rem] rounded-full bg-primary/20 blur-[140px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative container py-24 md:py-32 text-center"
        >
          <span className="luxury-eyebrow mb-6 inline-flex items-center gap-2"><Sparkles className="h-3 w-3" /> Specials</span>
          <h1 className="luxury-hero-title text-6xl md:text-7xl mb-2">
            Smokehouse <span className="italic text-gradient-ember">Specials</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-8 mb-6">
            <span className="luxury-gold-line" />
            <p className="font-stencil text-xs md:text-sm text-gold tracking-[0.32em]">Fresh from the Pit · Limited Time</p>
            <span className="luxury-gold-line" />
          </div>
          <p className="luxury-subtitle max-w-xl mx-auto">
            Daily features, midday lunch plates, holiday classics, and the Community Heroes Deal — all in one place.
          </p>
        </motion.div>
      </section>

      <section className="container py-14 space-y-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <SpecialsBlock title="Today's Smokehouse Special" subtitle="Fresh from the pit. Available for a limited time." items={groups.today} hero icon={<Flame className="h-3 w-3" />} eyebrow="Today Only" />
            <SpecialsBlock title="Lunch Specials" subtitle="Midday smokehouse favorites served fast, fresh, and bold." items={groups.lunch} icon={<Sparkles className="h-3 w-3" />} eyebrow="Mon – Fri · 11 AM – 2 PM" />
            <SpecialsBlock title="Holiday Specials" subtitle="Traditional holiday plates from our pit to your table." items={groups.holiday} icon={<CalendarIcon className="h-3 w-3" />} eyebrow="Holiday Only" />

            <CommunityHeroesCallout />

            {groups.upcoming.length > 0 && (
              <SpecialsBlock title="Upcoming Specials" subtitle="A look at what's coming soon to the menu." items={groups.upcoming} icon={<CalendarIcon className="h-3 w-3" />} eyebrow="Coming Soon" />
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
};

function SpecialsBlock({
  title, subtitle, items, hero = false, icon, eyebrow,
}: {
  title: string; subtitle: string; items: Special[]; hero?: boolean; icon?: React.ReactNode; eyebrow?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        {eyebrow && <span className="luxury-badge mb-4 inline-flex items-center gap-2">{icon}{eyebrow}</span>}
        <h2 className="luxury-menu-title text-4xl md:text-5xl mb-4">{title}</h2>
        <span className="luxury-gold-line mx-auto block mb-4" />
        <p className="luxury-subtitle max-w-xl mx-auto">{subtitle}</p>
      </motion.div>
      <div className={hero && items.length === 1 ? "max-w-3xl mx-auto" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
        {items.map((s, i) => <SpecialCard key={s.id} special={s} index={i} variant={hero ? "hero" : "default"} />)}
      </div>
    </div>
  );
}

function CommunityHeroesCallout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="luxury-card p-8 md:p-10 max-w-4xl mx-auto text-center"
    >
      <span className="luxury-badge mb-5 inline-flex items-center gap-2"><Heart className="h-3 w-3" /> Community Heroes Deal</span>
      <h2 className="luxury-menu-title text-3xl md:text-4xl mb-4">A Small Thank You for Those Who Serve</h2>
      <span className="luxury-gold-line mx-auto block mb-5" />
      <p className="luxury-subtitle max-w-xl mx-auto mb-6">
        10% off eligible orders for Law Enforcement, Firefighters, Teachers, and Veterans. Apply at checkout — valid ID required at pickup or delivery.
      </p>
      <Link to="/menu">
        <button className="luxury-primary-btn h-12 px-8 font-stencil text-xs tracking-widest">Start Order</button>
      </Link>
    </motion.div>
  );
}

export default Specials;
