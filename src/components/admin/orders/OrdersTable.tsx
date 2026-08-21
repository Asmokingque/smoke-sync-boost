import { Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderStatusSelect } from "@/components/admin/orders/OrderStatusSelect";
import { PaymentStatusSelect } from "@/components/admin/orders/PaymentStatusSelect";
import type { OrderWithItems } from "@/types/orders";
import type { AdminOrderFilter } from "@/lib/ordering";

const filters: Array<{ value: AdminOrderFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type OrdersTableProps = {
  orders: OrderWithItems[];
  filter: AdminOrderFilter;
  search: string;
  onFilterChange: (value: AdminOrderFilter) => void;
  onSearchChange: (value: string) => void;
  onView: (order: OrderWithItems) => void;
  onPrint: (order: OrderWithItems) => void;
  onStatusChange: (order: OrderWithItems, value: string) => void;
  onPaymentStatusChange: (order: OrderWithItems, value: string) => void;
};

export function OrdersTable({
  orders,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onView,
  onPrint,
  onStatusChange,
  onPaymentStatusChange,
}: OrdersTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-full border px-4 py-2 text-xs font-stencil uppercase tracking-[0.18em] ${filter === option.value ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search order #, customer, phone"
          className="max-w-sm"
        />
      </div>

      <div className="rounded-3xl border border-gold/20 bg-card p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pickup Time</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-stencil text-xs uppercase tracking-[0.18em]">{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{order.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                </TableCell>
                <TableCell>{order.order_type}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <OrderStatusBadge status={order.status} />
                    <OrderStatusSelect value={order.status} onChange={(value) => onStatusChange(order, value)} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{order.payment_status}</div>
                    <PaymentStatusSelect value={order.payment_status} onChange={(value) => onPaymentStatusChange(order, value)} />
                  </div>
                </TableCell>
                <TableCell className="font-display text-gold">${Number(order.total).toFixed(2)}</TableCell>
                <TableCell>{order.pickup_time ? new Date(order.pickup_time).toLocaleString() : "ASAP"}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => onView(order)}><Eye className="mr-1 h-4 w-4" />View</Button>
                    <Button size="sm" variant="outline" onClick={() => onPrint(order)}><Printer className="mr-1 h-4 w-4" />Print</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
