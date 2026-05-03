import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Flame, Package, Truck, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const config: Record<
  string,
  { label: string; classes: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "Pending", classes: "bg-muted text-foreground border-border", Icon: Clock },
  new: { label: "New", classes: "bg-primary/15 text-primary border-primary/40", Icon: Flame },
  confirmed: { label: "Confirmed", classes: "bg-primary/15 text-primary border-primary/40", Icon: CheckCircle2 },
  preparing: { label: "Preparing", classes: "bg-amber-500/15 text-amber-300 border-amber-500/40", Icon: Loader2 },
  ready: { label: "Ready", classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40", Icon: Package },
  out_for_delivery: { label: "Out for Delivery", classes: "bg-sky-500/15 text-sky-300 border-sky-500/40", Icon: Truck },
  completed: { label: "Completed", classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", classes: "bg-destructive/15 text-destructive border-destructive/40", Icon: XCircle },
  contacted: { label: "Contacted", classes: "bg-amber-500/15 text-amber-300 border-amber-500/40", Icon: Clock },
  booked: { label: "Booked", classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40", Icon: CheckCircle2 },
  closed: { label: "Closed", classes: "bg-muted text-muted-foreground border-border", Icon: XCircle },
};

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = config[status] ?? { label: status, classes: "bg-muted text-foreground border-border", Icon: Clock };
  const { Icon } = cfg;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-stencil text-[10px] tracking-widest border px-2.5 py-1", cfg.classes, className)}
    >
      <Icon className={cn("h-3 w-3", status === "preparing" && "animate-spin")} />
      {cfg.label}
    </Badge>
  );
}
