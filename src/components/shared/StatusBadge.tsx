/**
 * StatusBadge.tsx
 * Controls: small colored status pills (order status, availability, holiday
 * hours). One place to change how statuses look everywhere.
 */
type Tone = "neutral" | "success" | "warning" | "danger" | "gold";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-primary/10 text-primary border-primary/30",
  warning: "bg-gold/10 text-gold border-gold/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  gold: "bg-gold/10 text-gold border-gold/40",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className = "",
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-stencil text-[10px] uppercase tracking-widest ${toneClasses[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
