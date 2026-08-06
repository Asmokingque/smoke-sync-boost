/**
 * StatCard.tsx
 * Controls: the metric tiles on the admin dashboard homepage.
 */
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  to?: string;
  tone?: "primary" | "gold";
};

export function StatCard({ label, value, hint, icon: Icon, to, tone = "primary" }: Props) {
  const accent = tone === "gold" ? "text-gold border-gold/30" : "text-primary border-primary/30";
  const card = (
    <div className="retina-menu-card p-5 h-full transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <span className="font-stencil text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <span className={`rounded-full border p-2 ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="font-serif text-4xl mt-3">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
  return to ? <Link to={to} className="block h-full">{card}</Link> : card;
}
