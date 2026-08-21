import type { OrderWithItems } from "@/types/orders";

export function OrderTicketPrintView({ order }: { order: OrderWithItems }) {
  return (
    <div className="space-y-3 font-mono text-sm text-foreground print:block">
      <div>
        <div>Anderson's Smoking Que</div>
        <div>Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</div>
        <div>{new Date(order.created_at).toLocaleString()}</div>
      </div>
      <div>
        <div>{order.customer_name}</div>
        <div>{order.customer_phone}</div>
        <div>{order.order_type}</div>
      </div>
      <ul className="space-y-1">
        {order.order_items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.item_name} — ${Number(item.line_total).toFixed(2)}
          </li>
        ))}
      </ul>
      <div>Total: ${Number(order.total).toFixed(2)}</div>
    </div>
  );
}
