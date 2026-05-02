import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2, Camera, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getVisitorId } from "@/lib/visitorId";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  photo_url: string | null;
  created_at: string;
  likes_count: number;
};

const schema = z.object({
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, "Tell us a bit more (10+ chars)").max(1000),
  rating: z.number().int().min(1).max(5),
});

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  };

  const fetchMyLikes = async () => {
    const visitor = getVisitorId();
    const { data } = await supabase
      .from("review_likes")
      .select("review_id")
      .eq("visitor_id", visitor);
    setLikedIds(new Set((data ?? []).map((r: any) => r.review_id)));
  };

  useEffect(() => { fetchReviews(); fetchMyLikes(); }, []);

  const toggleLike = async (reviewId: string) => {
    const visitor = getVisitorId();
    const liked = likedIds.has(reviewId);
    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.delete(reviewId) : next.add(reviewId);
      return next;
    });
    setReviews((prev) => prev.map((r) =>
      r.id === reviewId ? { ...r, likes_count: r.likes_count + (liked ? -1 : 1) } : r
    ));
    if (liked) {
      const { error } = await supabase.from("review_likes").delete()
        .eq("review_id", reviewId).eq("visitor_id", visitor);
      if (error) { toast.error("Could not unlike"); fetchReviews(); fetchMyLikes(); }
    } else {
      const { error } = await supabase.from("review_likes")
        .insert({ review_id: reviewId, visitor_id: visitor });
      if (error) { toast.error("Could not like"); fetchReviews(); fetchMyLikes(); }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ title, body, rating });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (file) {
        if (file.size > 5_000_000) throw new Error("Photo must be under 5 MB");
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
        const { error: upErr } = await supabase.storage.from("review-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("review-photos").getPublicUrl(path);
        photo_url = pub.publicUrl;
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        author_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Guest",
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        body: parsed.data.body,
        photo_url,
        is_approved: false,
      });
      if (error) throw error;
      toast.success("Thanks! Your review will appear once approved.");
      setTitle(""); setBody(""); setRating(5); setFile(null);
    } catch (err: any) {
      toast.error(err.message ?? "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">The Experience Wall</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4">Customer Reviews</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hear what folks are saying — and share your own story.
          </p>
        </div>
      </section>

      <section className="container py-12 grid lg:grid-cols-[1fr_400px] gap-10">
        <div>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Be the first to share your experience.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <article key={r.id} className="bg-gradient-card border border-border rounded-lg p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  {r.title && <h3 className="font-stencil text-base mb-1">{r.title}</h3>}
                  <p className="text-sm text-muted-foreground mb-3">{r.body}</p>
                  {r.photo_url && (
                    <img src={r.photo_url} alt="" loading="lazy" className="w-full h-40 object-cover rounded-md mb-3" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      — {r.author_name} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleLike(r.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-stencil transition-colors ${
                        likedIds.has(r.id)
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                      aria-label={likedIds.has(r.id) ? "Unlike review" : "Like review"}
                    >
                      <Heart className={`h-3.5 w-3.5 ${likedIds.has(r.id) ? "fill-primary" : ""}`} />
                      {r.likes_count}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-charcoal-light border border-border rounded-lg p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-2xl mb-4 tracking-wider">Leave a Review</h2>
          {!user ? (
            <div>
              <p className="text-muted-foreground mb-4 text-sm">Sign in to share your experience.</p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 font-stencil"><Link to="/auth">Sign In</Link></Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label className="mb-2 block">Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <Star className={`h-7 w-7 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rtitle">Title</Label>
                <Input id="rtitle" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rbody">Your review *</Label>
                <Textarea id="rbody" required value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfile" className="flex items-center gap-2 cursor-pointer">
                  <Camera className="h-4 w-4" /> Add photo (optional)
                </Label>
                <Input id="rfile" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
              </Button>
            </form>
          )}
        </aside>
      </section>
    </SiteLayout>
  );
};

export default Reviews;
