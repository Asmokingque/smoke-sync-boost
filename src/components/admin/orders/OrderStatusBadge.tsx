import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock3, Flame, PackageCheck, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrderStatusLabel } from "@/lib/ordering";

const config: Record<string, { className: string; Icon: React.ComponentType<{ className?: string }> }> = {
  pending: { className: "border-gold/40 bg-[#C8A24A]/10 text-gold", Icon: Clock3 },
  confirmed: { className: "border-blue-500/40 bg-blue-500/10 text-blue-300", Icon: CheckCircle2 },
  preparing: { className: "border-orange-500/40 bg-orange-500/10 text-orange-300", Icon: Flame },
  ready: { className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300", Icon: PackageCheck },
  out_for_delivery: { className: "border-teal-500/40 bg-teal-500/10 text-teal-300", Icon: Truck },
  completed: { className: "border-slate-500/40 bg-slate-500/10 text-slate-300", Icon: CheckCircle2 },
  cancelled: { className: "border-red-500/40 bg-red-500/10 text-red-300", Icon: XCircle },
};

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = config[status] ?? config.pending;
  const Icon = cfg.Icon;
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 font-stencil text-[10px] uppercase tracking-[0.18em]", cfg.className, className)}>
      <Icon className={cn("h-3.5 w-3.5", status === "preparing" && "animate-pulse")} />
      {getOrderStatusLabel(status)}
    </Badge>
  );
}
