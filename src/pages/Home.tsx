import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Clock, Award, ChevronRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SmokeBackground } from "@/components/ui/SmokeBackground";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import hero from "@/assets/hero-bbq.jpg";
import logo from "@/assets/logo.png";

const Home = () => {
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

        <div className="relative container py-28 md:py-40 lg:py-48">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="badge-premium mb-6"
              >
                <Flame className="h-3 w-3" />
                <span>Hardwood Smoked Daily</span>
              </motion.div>

              <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-[0.95] mb-2 tracking-tight">
                Anderson's
                <br />
                <span className="italic text-gradient-ember">Smoking Que</span>
              </h1>

              <div className="flex items-center gap-4 mt-6 mb-5">
                <span className="gold-rule-short" />
                <p className="font-stencil text-sm md:text-base text-gold tracking-[0.32em]">
                  Smoked Low. Served Bold.
                </p>
                <span className="gold-rule-short" />
              </div>

              <p className="font-sans text-lg md:text-xl text-foreground/80 max-w-xl mb-10 leading-relaxed">
                Slow-smoked meats, Southern dinners, handcrafted sides, and catering — served with bold flavor and hometown hospitality.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link to="/menu">
                  <ShimmerButton>
                    <Plus className="h-5 w-5" /> Start Order
                  </ShimmerButton>
                </Link>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 font-stencil text-sm border-gold text-gold hover:bg-gold/10 hover:text-gold backdrop-blur bg-background/30">
                  <Link to="/menu">View Menu <ChevronRight className="h-5 w-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 font-stencil text-sm border-bone/30 backdrop-blur bg-background/30 text-foreground/90 hover:bg-background/50">
                  <Link to="/catering">Request Catering</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Featured favorite card overlay */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="hidden lg:block"
            >
              <div className="retina-menu-card p-7 ring-gold-soft">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-premium"><Award className="h-3 w-3" /> Today's Featured Favorite</span>
                  <span className="font-serif text-3xl text-primary">$15</span>
                </div>
                <h3 className="font-serif text-3xl mb-2 leading-tight">Two or Three Meat Plate</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Your pick of slow-smoked meats with two Southern sides and house cornbread.
                </p>
                <div className="gold-divider mb-5" />
                <Link to="/menu" className="block">
                  <Button className="w-full h-12 font-stencil text-sm bg-gradient-ember hover:opacity-90 shadow-ember">
                    <Plus className="h-4 w-4 mr-1" /> Add to Order
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="container py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Flame, title: "Wood-Fired", body: "Slow-smoked over hardwood for that deep, signature bark and smoke ring." },
            { icon: Clock, title: "Made Daily", body: "Cooked fresh every morning. When it's gone, it's gone — get yours early." },
            { icon: Award, title: "Catering Ready", body: "From small gatherings to large events, we bring the smokehouse to you." },
          ].map((f) => (
            <div key={f.title} className="bg-gradient-card border border-border rounded-lg p-8 shadow-card-soft">
              <f.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-display text-2xl mb-2 tracking-wider">{f.title}</h3>
              <p className="text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MENU PREVIEW */}
      <section className="container py-20 border-y border-border bg-charcoal-light/40">
        <div className="text-center mb-12">
          <div className="font-stencil text-sm text-primary mb-2">The Menu</div>
          <h2 className="font-display text-4xl md:text-5xl mb-4">Built Around Smoke & Spice</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Five categories of southern smokehouse classics. Browse the full menu and build your order.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 max-w-4xl mx-auto">
          {[
            { name: "Meats", emoji: "🥩" },
            { name: "Dinners", emoji: "🍽️" },
            { name: "Meats x Lb", emoji: "⚖️" },
            { name: "Sides", emoji: "🌽" },
            { name: "Desserts", emoji: "🍰" },
          ].map((c) => (
            <Link
              key={c.name}
              to="/menu"
              className="bg-card border border-border hover:border-primary/60 rounded-lg p-6 text-center transition-all hover:-translate-y-1 hover:shadow-ember"
            >
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="font-stencil text-sm">{c.name}</div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-stencil h-12 px-8">
            <Link to="/menu">View Full Menu</Link>
          </Button>
        </div>
      </section>

      {/* TAGLINE / CTA */}
      <section className="container py-24 text-center">
        <img src={logo} alt="" className="h-32 w-32 mx-auto mb-6 opacity-90" width={128} height={128} loading="lazy" />
        <h2 className="font-display text-4xl md:text-5xl mb-4">Got an Event?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Birthdays, family reunions, corporate lunches, weddings — we cater all of it. Tell us what you need.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-stencil h-12 px-8">
          <Link to="/catering">Request Catering</Link>
        </Button>
      </section>
    </SiteLayout>
  );
};

export default Home;
