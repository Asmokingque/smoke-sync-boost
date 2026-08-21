import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { getOrderStatusLabel } from "@/lib/ordering";

type ConfirmationState = {
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  total?: number;
  pickupInfo?: {
    orderType?: string;
    pickupDate?: string | null;
    pickupTime?: string | null;
    deliveryAddress?: string | null;
  };
  paymentMethod?: string;
  statusLookupToken?: string;
};

const OrderConfirmationPage = () => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const state = (location.state ?? {}) as ConfirmationState;

  return (
    <SiteLayout>
      <section className="container max-w-3xl py-16 text-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-gold/20 bg-card px-6 py-12 shadow-2xl"
        >
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 120 120" className="absolute h-28 w-28">
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#C8A24A"
                strokeWidth="4"
                initial={reducedMotion ? false : { pathLength: 0 }}
                animate={reducedMotion ? undefined : { pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </svg>
            <motion.div
              initial={reducedMotion ? false : { scale: 0.7, opacity: 0 }}
              animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 18 }}
              className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gold text-background"
            >
              <Check className="h-10 w-10" />
            </motion.div>
          </div>

          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <p className="font-stencil text-sm uppercase tracking-[0.3em] text-gold">Order Received</p>
            <h1 className="mt-3 font-serif text-5xl text-foreground">Thanks for your order.</h1>
            <p className="mt-3 text-muted-foreground">We've received your order and the smokehouse team will confirm it soon.</p>
          </motion.div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-gold/15 bg-background/40 p-6 text-left sm:grid-cols-2">
            <Info label="Order Number" value={state.orderNumber ?? "Pending"} />
            <Info label="Status" value={getOrderStatusLabel(state.status ?? "pending")} />
            <Info label="Payment" value={state.paymentMethod === "cash" ? "Cash" : "Pay at Pickup"} />
            <Info label="Total" value={`$${Number(state.total ?? 0).toFixed(2)}`} />
            <Info
              label={state.pickupInfo?.orderType === "Delivery" ? "Delivery Address" : "Pickup"}
              value={state.pickupInfo?.orderType === "Delivery" ? state.pickupInfo?.deliveryAddress ?? "Delivery" : `${state.pickupInfo?.pickupDate ?? ""} ${state.pickupInfo?.pickupTime ?? ""}`.trim() || "ASAP"}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/order-status${state.orderNumber && state.statusLookupToken ? `?orderNumber=${encodeURIComponent(state.orderNumber)}&token=${encodeURIComponent(state.statusLookupToken)}` : ""}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-gold/40 bg-primary px-6 font-stencil text-sm uppercase tracking-[0.2em] text-primary-foreground"
            >
              Track Order
            </Link>
            <Link
              to="/menu"
              className="inline-flex h-12 items-center justify-center rounded-full border border-gold/30 px-6 font-stencil text-sm uppercase tracking-[0.2em] text-foreground"
            >
              Return to Menu
            </Link>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-stencil text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

export default OrderConfirmationPage;
