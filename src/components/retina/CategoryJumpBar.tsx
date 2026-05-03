import { Star, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type JumpCategory = { slug: string; name: string };

export function CategoryJumpBar({
  categories,
  activeSlug,
  onJump,
  showFeatured = true,
  view,
  onViewChange,
  className,
}: {
  categories: JumpCategory[];
  activeSlug: string;
  onJump: (slug: string) => void;
  showFeatured?: boolean;
  view?: "card" | "list";
  onViewChange?: (v: "card" | "list") => void;
  className?: string;
}) {
  return (
    <div className={cn("sticky top-16 md:top-20 z-30 retina-glass border-b border-border/60", className)}>
      <div className="container py-3 flex items-center gap-3">
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {showFeatured && (
              <PillButton active={activeSlug === "featured"} onClick={() => onJump("featured")}>
                <Star className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />Featured
              </PillButton>
            )}
            {categories.map((c) => (
              <PillButton key={c.slug} active={activeSlug === c.slug} onClick={() => onJump(c.slug)}>
                {c.name}
              </PillButton>
            ))}
          </div>
        </div>
        {view && onViewChange && (
          <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-md p-1 shrink-0">
            <button
              onClick={() => onViewChange("card")}
              aria-label="Card view"
              className={cn(
                "p-2 rounded transition-colors",
                view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewChange("list")}
              aria-label="List view"
              className={cn(
                "p-2 rounded transition-colors",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-stencil text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all border",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-ember"
          : "bg-secondary/60 text-foreground/80 border-border hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
