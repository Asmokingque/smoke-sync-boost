import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReviewLike = {
  id: string;
  author_name: string;
  rating: number;
  title?: string | null;
  body: string;
  photo_url?: string | null;
  created_at: string;
  likes_count: number;
};

export function ReviewPhotoCard({
  review,
  liked,
  onToggleLike,
  index = 0,
}: {
  review: ReviewLike;
  liked: boolean;
  onToggleLike: () => void;
  index?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -3 }}
      className="group relative retina-card rounded-3xl overflow-hidden flex flex-col"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
      <span aria-hidden className="retina-shine rounded-3xl" />

      {review.photo_url && (
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={review.photo_url}
            alt={`Photo by ${review.author_name}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("h-4 w-4", i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30")}
            />
          ))}
        </div>
        {review.title && <h3 className="font-stencil text-base leading-tight">{review.title}</h3>}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{review.body}</p>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div className="text-xs text-muted-foreground">
            — {review.author_name} · {new Date(review.created_at).toLocaleDateString()}
          </div>
          <button
            type="button"
            onClick={onToggleLike}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-stencil transition-all",
              liked
                ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_18px_hsl(var(--bbq-crimson)/0.35)]"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            aria-label={liked ? "Unlike review" : "Like review"}
          >
            <Heart className={cn("h-3.5 w-3.5 transition-transform", liked && "fill-primary scale-110")} />
            {review.likes_count}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
