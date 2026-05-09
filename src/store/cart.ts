import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SelectedOption = {
  group: string;
  name: string;
  price_adjustment: number;
};

export type CartItem = {
  id: string;          // unique cart line id (menu_item_id + options hash)
  menuItemId: string;  // original menu_items.id (for FK on order_items)
  name: string;
  price: number;       // unit price including option adjustments
  quantity: number;
  notes?: string;
  priceLabel?: string | null;
  optionLabel?: string;
  selectedOptions?: SelectedOption[];
  specialId?: string;
  specialItemId?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "asq-cart", version: 2 }
  )
);
