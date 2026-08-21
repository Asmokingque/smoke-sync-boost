import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { CustomerInformationForm } from "@/components/checkout/CustomerInformationForm";
import { OrderTypeSelector } from "@/components/checkout/OrderTypeSelector";
import { PickupTimeSelector } from "@/components/checkout/PickupTimeSelector";
import { DeliveryAddressForm } from "@/components/checkout/DeliveryAddressForm";
import { CommunityHeroesSelector } from "@/components/checkout/CommunityHeroesSelector";
import { TipSelector } from "@/components/checkout/TipSelector";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { SubmitOrderButton } from "@/components/checkout/SubmitOrderButton";
import type { CheckoutFormValues } from "@/components/checkout/types";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const DELIVERY_FEE = 6.99;

const defaultValues: CheckoutFormValues = {
  customer: { name: "", phone: "", email: "" },
  orderType: "Pickup",
  pickupDate: "",
  pickupTime: "",
  deliveryAddress: { street: "", apt: "", city: "", state: "", zip: "" },
  notes: "",
  communityGroup: "",
  tipMode: "none",
  tipCustom: "",
  paymentMethod: "pay_at_pickup",
};

const parseTip = (subtotal: number, values: CheckoutFormValues) => {
  switch (values.tipMode) {
    case "10":
      return subtotal * 0.1;
    case "15":
      return subtotal * 0.15;
    case "20":
      return subtotal * 0.2;
    case "custom":
      return Number(values.tipCustom || 0);
    default:
      return 0;
  }
};

const CheckoutPage = () => {
  const form = useForm<CheckoutFormValues>({ defaultValues });
  const navigate = useNavigate();
  const { items, estimatedSubtotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const values = form.watch();
  const tip = useMemo(() => parseTip(estimatedSubtotal, values), [estimatedSubtotal, values]);
  const deliveryFee = values.orderType === "Delivery" ? DELIVERY_FEE : 0;

  const onSubmit = form.handleSubmit(async (formValues) => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!formValues.customer.name || !formValues.customer.phone || !formValues.customer.email) {
      toast.error("Please complete your customer information.");
      return;
    }

    if (formValues.orderType === "Delivery" && !formValues.deliveryAddress.street) {
      toast.error("Please enter a delivery address.");
      return;
    }

    const requestId = crypto.randomUUID();
    setSubmitting(true);
    trackEvent("checkout_submitted", { items: items.length });

    const payload = {
      requestId,
      cartItems: items,
      customer: formValues.customer,
      orderType: formValues.orderType,
      pickupDate: formValues.pickupDate,
      pickupTime: formValues.pickupTime,
      deliveryAddress:
        formValues.orderType === "Delivery"
          ? [
              formValues.deliveryAddress.street,
              formValues.deliveryAddress.apt,
              `${formValues.deliveryAddress.city}, ${formValues.deliveryAddress.state} ${formValues.deliveryAddress.zip}`,
            ]
              .filter(Boolean)
              .join(", ")
          : null,
      notes: formValues.notes,
      communityGroup: formValues.communityGroup || null,
      tip,
    };

    const { data, error } = await supabase.functions.invoke("create-order", { body: payload });
    setSubmitting(false);

    if (error) {
      toast.error(error.message || "Unable to create your order.");
      return;
    }

    clearCart();
    trackEvent("order_created", { orderNumber: data.orderNumber });
    navigate("/order-confirmation", {
      state: {
        orderNumber: data.orderNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        total: data.total,
        pickupInfo: data.pickupInfo,
        statusLookupToken: data.statusLookupToken,
        paymentMethod: formValues.paymentMethod,
      },
    });
  });

  return (
    <SiteLayout>
      <section className="container max-w-6xl py-12 space-y-8">
        <div className="space-y-3">
          <p className="font-stencil text-sm uppercase tracking-[0.3em] text-gold">Checkout</p>
          <h1 className="font-serif text-5xl text-foreground">Finish Your Order</h1>
          <p className="max-w-2xl text-muted-foreground">
            Review your order details, choose pickup or delivery, and send it to the pit crew.
          </p>
        </div>

        <CheckoutProgress currentStep={3} />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <FormProvider {...form}>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="rounded-3xl border border-gold/20 bg-card p-6 space-y-5">
                <h2 className="font-serif text-2xl">Customer Information</h2>
                <CustomerInformationForm form={form} />
              </div>

              <div className="rounded-3xl border border-gold/20 bg-card p-6 space-y-5">
                <h2 className="font-serif text-2xl">Order Type</h2>
                <OrderTypeSelector value={values.orderType} onChange={(value) => form.setValue("orderType", value)} />
                <PickupTimeSelector form={form} />
                {values.orderType === "Delivery" && <DeliveryAddressForm form={form} />}
              </div>

              <CommunityHeroesSelector
                value={values.communityGroup}
                onChange={(value) => form.setValue("communityGroup", value)}
              />

              <TipSelector
                value={values.tipMode}
                customValue={values.tipCustom}
                onChange={(value) => form.setValue("tipMode", value)}
                onCustomValueChange={(value) => form.setValue("tipCustom", value)}
              />

              <PaymentMethodSelector
                value={values.paymentMethod}
                onChange={(value) => form.setValue("paymentMethod", value)}
              />

              <div className="rounded-3xl border border-gold/20 bg-card p-6 space-y-3">
                <label className="font-serif text-2xl" htmlFor="checkout-notes">Order Notes</label>
                <textarea
                  id="checkout-notes"
                  rows={4}
                  value={values.notes}
                  onChange={(event) => form.setValue("notes", event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                  placeholder="Sauce on the side, special instructions, and more."
                />
              </div>

              <SubmitOrderButton submitting={submitting} disabled={!items.length} />
            </form>
          </FormProvider>

          <div className="space-y-6">
            <CheckoutOrderSummary deliveryFee={deliveryFee} tip={tip} discount={values.communityGroup ? estimatedSubtotal * 0.1 : 0} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default CheckoutPage;
