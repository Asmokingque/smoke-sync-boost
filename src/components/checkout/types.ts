export type CheckoutOrderType = "Pickup" | "Delivery";
export type CheckoutPaymentMethod = "pay_at_pickup" | "cash";

export type CheckoutFormValues = {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  orderType: CheckoutOrderType;
  pickupDate: string;
  pickupTime: string;
  deliveryAddress: {
    street: string;
    apt: string;
    city: string;
    state: string;
    zip: string;
  };
  notes: string;
  communityGroup: string;
  tipMode: "none" | "10" | "15" | "20" | "custom";
  tipCustom: string;
  paymentMethod: CheckoutPaymentMethod;
};
