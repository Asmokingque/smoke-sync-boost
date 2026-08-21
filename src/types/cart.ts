export type CartItem = {
  cartItemId: string;
  menuItemId: string;
  itemSlug: string;
  itemName: string;
  imageUrl: string | null;
  quantity: number;
  selectedOptionIds: string[];
  selectedOptionsForDisplay: Array<{ group: string; name: string; priceAdjustment: number }>;
  notes: string;
  estimatedUnitPrice: number;
  estimatedLineTotal: number;
};
