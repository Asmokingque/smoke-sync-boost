/**
 * ExperiencePreviewSection.tsx
 * Controls: the homepage guest-reviews teaser ("Experience Wall").
 * Pulls the newest approved reviews from the database; shows nothing but the
 * invite card when there are none yet.
 */
import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PremiumCard } from "@/components/shared/PremiumCard";
import { PremiumButton } from "@/components/shared/PremiumButton";
import { siteContent } from "@/data/siteContent";

type Review = { id: string; author_name: string; rating: number; title: string | null; body: string };

/** Copy lives in src/data/siteContent.ts */
const experienceCopy = siteContent.experience;

export function ExperiencePreviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("reviews")
      .select("id, author_name, rating, title, body")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (active && data) setReviews(data as Review[]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="container py-20">
      <SectionHeader
        badge={experienceCopy.badge}
        badgeIcon={Star}
        title={experienceCopy.title}
        subtitle={experienceCopy.subtitle}
      />

      {reviews.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {reviews.map((r) => (
            <PremiumCard key={r.id} className="flex flex-col">
              <Quote className="h-6 w-6 text-gold mb-4" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-gold fill-current" />
                ))}
              </div>
              {r.title && <h4 className="luxury-menu-title text-xl mb-2">{r.title}</h4>}
              <p className="luxury-subtitle text-sm flex-1 mb-4 line-clamp-5">{r.body}</p>
              <span className="font-stencil text-[10px] uppercase tracking-widest text-muted-foreground">
                — {r.author_name}
              </span>
            </PremiumCard>
          ))}
        </div>
      )}

      <div className="text-center">
        <PremiumButton to="/reviews">{siteContent.callToAction.leaveReview}</PremiumButton>
      </div>
    </section>
  );
}
