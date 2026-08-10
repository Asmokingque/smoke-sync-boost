import { getErrorMessage } from "@/lib/errors";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useMemo } from "react";

export type CheckoutCartItem = {
  menuItemId: string;
  specialId?: string;
  specialItemId?: string;
  quantity: number;
  selectedOptionIds?: string[];
  notes?: string;
};

export type CheckoutCustomerInfo = {
  customerName: string;
  phone: string;
  email?: string;
  orderType: "Pickup" | "Delivery";
  pickupDate?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  orderNotes?: string;
  tipCents?: number;
  communityGroup?: string;
};

interface Props {
  cartItems: CheckoutCartItem[];
  customerInfo: CheckoutCustomerInfo;
  returnUrl: string;
  onError?: (msg: string) => void;
}

export function StripeEmbeddedCheckout({ cartItems, customerInfo, returnUrl, onError }: Props) {
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        cartItems,
        customerInfo,
        returnUrl,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      const msg = getErrorMessage(error, "") || data?.error || "Failed to start checkout";
      onError?.(msg);
      throw new Error(msg);
    }
    return data.clientSecret as string;
  }, [cartItems, customerInfo, returnUrl, onError]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return (
    <div id="checkout" className="rounded-lg overflow-hidden border border-gold/20 bg-background/50">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
