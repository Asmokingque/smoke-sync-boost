import { CheckCircle2, Circle, CreditCard, Flame, Package, ChefHat, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  key: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  { key: "placed", label: "Placed", Icon: Circle },
  { key: "paid", label: "Paid", Icon: CreditCard },
  { key: "confirmed", label: "Confirmed", Icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", Icon: ChefHat },
  { key: "ready", label: "Ready", Icon: Package },
  { key: "completed", label: "Completed", Icon: Flame },
];

const FAILURE_STATES: Record<string, { label: string; description: string; Icon: React.ComponentType<{ className?: string }> }> = {
  failed: { label: "Payment Failed", description: "Your card was declined. Please try again.", Icon: XCircle },
  expired: { label: "Session Expired", description: "Checkout expired before payment completed.", Icon: AlertTriangle },
  refunded: { label: "Refunded", description: "This order has been refunded.", Icon: RotateCcw },
  cancelled: { label: "Cancelled", description: "This order was cancelled.", Icon: XCircle },
};

function activeIndex(status?: string | null, paymentStatus?: string | null): number {
  if (status === "completed") return 5;
  if (status === "ready") return 4;
  if (status === "preparing") return 3;
  if (status === "confirmed") return 2;
  if (paymentStatus === "paid") return 1;
  return 0;
}

export interface OrderStatusTimelineProps {
  status?: string | null;
  paymentStatus?: string | null;
  className?: string;
  compact?: boolean;
}

export function OrderStatusTimeline({ status, paymentStatus, className, compact }: OrderStatusTimelineProps) {
  const failureKey =
    paymentStatus === "failed" || paymentStatus === "expired" || paymentStatus === "refunded"
      ? paymentStatus
      : status === "cancelled"
        ? "cancelled"
        : null;

  if (failureKey) {
    const f = FAILURE_STATES[failureKey];
    const FIcon = f.Icon;
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3",
          className,
        )}
      >
        <FIcon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="text-left">
          <div className="font-stencil text-xs tracking-widest text-destructive uppercase">{f.label}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{f.description}</div>
        </div>
      </div>
    );
  }

  const active = activeIndex(status, paymentStatus);

  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-start justify-between gap-1">
        {STEPS.map((step, idx) => {
          const reached = idx <= active;
          const current = idx === active;
          const Icon = reached ? CheckCircle2 : step.Icon;
          return (
            <li key={step.key} className="flex-1 flex flex-col items-center text-center relative">
              {idx > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3 right-1/2 h-px w-full -z-0 transition-colors",
                    idx <= active ? "bg-gold/60" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                  reached
                    ? "border-gold/60 bg-gold/15 text-gold"
                    : "border-border bg-card text-muted-foreground",
                  current && "ring-2 ring-gold/40 ring-offset-2 ring-offset-background",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {!compact && (
                <span
                  className={cn(
                    "mt-2 font-stencil text-[9px] md:text-[10px] tracking-widest uppercase",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
