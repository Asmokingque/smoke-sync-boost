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
          <img src={hero} alt="" width={1920} height={1080} className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/70 to-background" />
        </div>

        <div className="relative container py-24 md:py-36 lg:py-44">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 mb-6 border border-primary/30">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="font-stencil text-xs text-primary">Hardwood Smoked Daily</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-6 animate-fade-in-up">
              SMOKED LOW.<br />
              <span className="text-gradient-ember">SERVED BOLD.</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/85 max-w-xl mb-8">
              Authentic southern BBQ from <strong className="text-foreground">Anderson's Smoking Que</strong> — 
              ribs, brisket, pulled pork, and hand-made sides built around generations of recipes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 font-stencil text-base shadow-ember">
                <Link to="/menu">
                  Order Now <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 font-stencil text-base border-bone/40">
                <Link to="/catering">Catering Inquiries</Link>
              </Button>
            </div>
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
