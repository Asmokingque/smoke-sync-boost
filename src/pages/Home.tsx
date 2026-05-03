import { Link } from "react-router-dom";
import { Flame, Clock, Award, ChevronRight, Plus, Sparkles, CalendarDays, Heart, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SmokeBackground } from "@/components/ui/SmokeBackground";
import { useSpecials } from "@/hooks/useSpecials";
import { useHolidayEvents } from "@/hooks/useHolidayEvents";
import { isVisibleNow } from "@/lib/specials";
import { SpecialCard } from "@/components/specials/SpecialCard";
import hero from "@/assets/hero-bbq.jpg";
import logo from "@/assets/logo.png";

const Home = () => {
  const { specials } = useSpecials({ activeOnly: true });
  const { events: upcomingHolidays } = useHolidayEvents({ upcomingOnly: true });
  const todaysSpecial = specials.find((s) => s.type === "daily" && isVisibleNow(s));
  const lunchSpecials = specials.filter((s) => s.type === "lunch" && isVisibleNow(s)).slice(0, 3);
  const nextHolidays = upcomingHolidays.slice(0, 3);
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="" width={1920} height={1080} className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/85 to-background" />
          {/* Crimson glow behind heading */}
          <div aria-hidden className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[42rem] w-[42rem] rounded-full bg-primary/25 blur-[140px]" />
        </div>
        <SmokeBackground density="lg" />

        <div className="relative container py-36 md:py-52 lg:py-64 min-h-[88vh] flex items-center">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="luxury-eyebrow mb-6 inline-flex items-center gap-2"
              >
                <Flame className="h-3 w-3" />
                <span>Premium Southern Smokehouse</span>
              </motion.div>

              <h1 className="luxury-hero-title text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] mb-2">
                Anderson's
                <br />
                <span className="italic text-gradient-ember">Smoking Que</span>
              </h1>

              <div className="flex items-center gap-4 mt-8 mb-6">
                <span className="luxury-gold-line" />
                <p className="font-stencil text-sm md:text-base text-gold tracking-[0.32em]">
                  Smoked Low. Served Bold.
                </p>
                <span className="luxury-gold-line" />
              </div>

              <p className="luxury-subtitle max-w-xl mb-12">
                Slow-smoked meats, Southern dinners, handcrafted sides, and catering prepared with bold flavor, patience, and hometown pride.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link to="/menu">
                  <button className="luxury-primary-btn h-14 px-8 font-stencil text-sm tracking-widest inline-flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Start Order
                  </button>
                </Link>
                <Link to="/menu">
                  <button className="luxury-secondary-btn h-14 px-8 font-stencil text-sm tracking-widest inline-flex items-center gap-2">
                    View Menu <ChevronRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link to="/catering">
                  <button className="luxury-secondary-btn h-14 px-8 font-stencil text-sm tracking-widest">
                    Request Catering
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Featured favorite card overlay */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="hidden lg:block"
            >
              <div className="luxury-card p-8">
                <div className="flex items-center justify-between mb-5">
                  <span className="luxury-badge inline-flex items-center gap-1"><Award className="h-3 w-3" /> Signature Favorite</span>
                  <span className="luxury-price font-serif text-xl">$15</span>
                </div>
                <h3 className="luxury-menu-title text-3xl mb-3 leading-tight">Two or Three Meat Plate</h3>
                <p className="luxury-subtitle text-sm mb-6">
                  Your choice of slow-smoked meats with classic Southern sides and house cornbread.
                </p>
                <div className="luxury-divider mb-6" />
                <Link to="/menu" className="block">
                  <button className="luxury-primary-btn w-full h-12 font-stencil text-sm tracking-widest inline-flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add to Order
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TODAY'S SPECIAL + QUICK BUTTONS */}
      <section className="container py-20 md:py-24">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="luxury-badge mb-4 inline-flex items-center gap-2"><Flame className="h-3 w-3" /> Today Only</span>
              <h2 className="luxury-menu-title text-4xl md:text-5xl mb-3">Today's Smokehouse Special</h2>
              <span className="luxury-gold-line block mb-3" />
              <p className="luxury-subtitle">Fresh from the pit. Available for a limited time.</p>
            </motion.div>
            {todaysSpecial ? (
              <SpecialCard special={todaysSpecial} variant="hero" />
            ) : (
              <div className="luxury-card p-8 text-center">
                <p className="luxury-subtitle mb-4">No daily special posted right now — check back soon, or browse the full menu.</p>
                <Link to="/menu"><button className="luxury-secondary-btn h-11 px-6 font-stencil text-xs tracking-widest">View Menu</button></Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/specials", label: "Today's Special", icon: Flame },
              { to: "/specials", label: "Lunch Specials", icon: UtensilsCrossed },
              { to: "/holiday-calendar", label: "Holiday Calendar", icon: CalendarDays },
              { to: "/specials", label: "Heroes Deal", icon: Heart },
            ].map((q) => (
              <Link key={q.label} to={q.to} className="luxury-card p-5 flex flex-col items-start gap-3 hover:-translate-y-1 transition-transform">
                <q.icon className="h-6 w-6 text-gold" />
                <span className="font-stencil text-xs tracking-widest text-foreground">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {lunchSpecials.length > 0 && (
          <div className="mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <span className="luxury-badge mb-4 inline-flex items-center gap-2"><Sparkles className="h-3 w-3" /> Mon – Fri · 11 AM – 2 PM</span>
              <h2 className="luxury-menu-title text-4xl md:text-5xl mb-3">Lunch Specials</h2>
              <span className="luxury-gold-line mx-auto block mb-3" />
              <p className="luxury-subtitle max-w-xl mx-auto">Midday smokehouse favorites served fast, fresh, and bold.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lunchSpecials.map((s, i) => <SpecialCard key={s.id} special={s} index={i} />)}
            </div>
            <div className="text-center mt-10">
              <Link to="/specials"><button className="luxury-secondary-btn h-12 px-8 font-stencil text-xs tracking-widest">View All Specials</button></Link>
            </div>
          </div>
        )}
      </section>

      {/* UPCOMING HOLIDAYS */}
      {nextHolidays.length > 0 && (
        <section className="container py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="luxury-badge mb-4 inline-flex items-center gap-2"><CalendarDays className="h-3 w-3" /> On the Calendar</span>
            <h2 className="luxury-menu-title text-4xl md:text-5xl mb-3">Upcoming Holidays</h2>
            <span className="luxury-gold-line mx-auto block mb-3" />
            <p className="luxury-subtitle max-w-xl mx-auto">Plan ahead — our holiday hours and BBQ specials.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {nextHolidays.map((h) => (
              <Link key={h.id} to="/holiday-calendar" className="luxury-card p-6 flex flex-col items-start gap-3 hover:-translate-y-1 transition-transform">
                <div className="flex items-baseline gap-3">
                  <span className="font-stencil text-[10px] text-gold tracking-widest uppercase">
                    {new Date(h.holiday_date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}
                  </span>
                  <span className="luxury-menu-title text-3xl leading-none">
                    {new Date(h.holiday_date + "T00:00:00").getDate()}
                  </span>
                </div>
                <div className="luxury-menu-title text-xl">{h.holiday_name}</div>
                <span className="luxury-badge inline-flex">{h.business_status ?? "Open"}</span>
                {h.banner_message && (
                  <p className="luxury-subtitle text-xs">{h.banner_message}</p>
                )}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/holiday-calendar"><button className="luxury-secondary-btn h-12 px-8 font-stencil text-xs tracking-widest">Full Holiday Calendar</button></Link>
          </div>
        </section>
      )}

      {/* HIGHLIGHTS */}
      <section className="container py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Flame, title: "Wood-Fired", body: "Slow-smoked over hardwood for that deep, signature bark and smoke ring." },
            { icon: Clock, title: "Made Daily", body: "Cooked fresh every morning. When it's gone, it's gone — get yours early." },
            { icon: Award, title: "Catering Ready", body: "From small gatherings to large events, we bring the smokehouse to you." },
          ].map((f) => (
            <div key={f.title} className="luxury-card p-8">
              <f.icon className="h-9 w-9 text-gold mb-4" />
              <h3 className="luxury-menu-title text-3xl mb-2">{f.title}</h3>
              <span className="luxury-gold-line block mb-4" />
              <p className="luxury-subtitle text-base">{f.body}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* SIGNATURE FAVORITES */}
      <section className="container py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="luxury-badge mb-5 inline-flex items-center gap-2"><Award className="h-3 w-3" /> Pitmaster Picks</span>
          <h2 className="luxury-category-title text-sm mb-4">Signature Favorites</h2>
          <h3 className="luxury-menu-title text-5xl md:text-6xl mb-5">The Bold &amp; The Smoky</h3>
          <span className="luxury-gold-line mx-auto block mb-5" />
          <p className="luxury-subtitle max-w-2xl mx-auto">
            The dishes our regulars come back for — slow-smoked, hand-built, and worth the wait.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { name: "Two Meat Plate", desc: "Your choice of two slow-smoked meats with two Southern sides and cornbread.", price: "$15" },
            { name: "Smoked Brisket by the Pound", desc: "Hardwood-smoked brisket, sliced fresh and sold by the pound.", price: "$28" },
            { name: "St. Louis Pork Ribs", desc: "Half or full slab — hand-rubbed and smoked low until tender.", price: "$22" },
          ].map((s) => (
            <div key={s.name} className="luxury-card p-8 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h4 className="luxury-menu-title text-2xl leading-tight">{s.name}</h4>
                <span className="luxury-price text-sm">{s.price}</span>
              </div>
              <span className="luxury-divider mb-4" />
              <p className="luxury-subtitle text-sm flex-1 mb-6">{s.desc}</p>
              <Link to="/menu">
                <button className="luxury-secondary-btn w-full h-11 font-stencil text-xs tracking-widest">View on Menu</button>
              </Link>
            </div>
          ))}
        </motion.div>
        <div className="text-center mt-12">
          <Link to="/menu">
            <button className="luxury-primary-btn h-14 px-10 font-stencil text-sm tracking-widest">View Full Menu</button>
          </Link>
        </div>
      </section>

      {/* TAGLINE / CTA */}
      <section className="container py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <img src={logo} alt="" className="h-28 w-28 mx-auto mb-6 opacity-90" width={112} height={112} loading="lazy" />
          <span className="luxury-badge mb-5">Catering</span>
          <h2 className="luxury-menu-title text-5xl md:text-6xl mb-4">An Event Worth Remembering</h2>
          <span className="luxury-gold-line mx-auto block mb-6" />
          <p className="luxury-subtitle max-w-xl mx-auto mb-10">
            Birthdays, reunions, corporate lunches, weddings — we bring the smokehouse to you with bold flavor and full-service hospitality.
          </p>
          <Link to="/catering">
            <button className="luxury-primary-btn h-14 px-12 font-stencil text-sm tracking-widest">Request Catering</button>
          </Link>
        </motion.div>
      </section>
    </SiteLayout>
  );
};

export default Home;
