import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { OrderWithItems } from "@/types/orders";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderTimeline, type OrderTimelineEntry } from "@/components/admin/orders/OrderTimeline";
import { OrderTicketPrintView } from "@/components/admin/orders/OrderTicketPrintView";

export function OrderDetailsDrawer({
  order,
  open,
  onOpenChange,
  timeline,
}: {
  order: OrderWithItems | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeline: OrderTimelineEntry[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l border-gold/20 bg-background sm:max-w-2xl">
        {order && (
          <div className="space-y-6 pr-4">
            <SheetHeader>
              <SheetTitle className="font-serif text-3xl">Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</SheetTitle>
              <SheetDescription>{order.customer_name} · {order.customer_phone}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {order.payment_status}
              </span>
            </div>

            <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
              <Detail label="Customer" value={order.customer_name} />
              <Detail label="Email" value={order.customer_email} />
              <Detail label="Phone" value={order.customer_phone} />
              <Detail label="Order Type" value={order.order_type} />
              <Detail label="Pickup Time" value={order.pickup_time ? new Date(order.pickup_time).toLocaleString() : "ASAP"} />
              <Detail label="Created" value={new Date(order.created_at).toLocaleString()} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-serif text-2xl">Items</h3>
              <ul className="mt-4 space-y-3">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 border-b border-border/40 pb-3 text-sm last:border-0">
                    <div>
                      <div className="font-medium text-foreground">{item.quantity}× {item.item_name}</div>
                      {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                    </div>
                    <div className="font-display text-gold">${Number(item.line_total).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-serif text-2xl">Audit History</h3>
              <div className="mt-4">
                <OrderTimeline entries={timeline} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-serif text-2xl">Ticket Preview</h3>
              <div className="mt-4">
                <OrderTicketPrintView order={order} />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-stencil text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}
