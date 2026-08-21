import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useCart as useLegacyCart } from "@/store/cart";
import { useCartUI } from "@/store/cartUi";
import type { CartItem as ContextCartItem } from "@/types/cart";
import { clampCartQuantity } from "@/lib/ordering";
import type { CartItem as LegacyCartItem, SelectedOption } from "@/store/cart";

type AddCartItemInput = Omit<ContextCartItem, "estimatedLineTotal"> & { estimatedLineTotal?: number };

type CartContextValue = {
  items: ContextCartItem[];
  itemCount: number;
  estimatedSubtotal: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemOptions: (
    cartItemId: string,
    selectedOptionIds: string[],
    selectedOptionsForDisplay: ContextCartItem["selectedOptionsForDisplay"],
    estimatedUnitPrice: number,
  ) => void;
  updateItemNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isOpen: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function toLegacySelectedOptions(
  options: ContextCartItem["selectedOptionsForDisplay"],
  selectedOptionIds: string[],
): SelectedOption[] {
  return options.map((option, index) => ({
    id: selectedOptionIds[index],
    group: option.group,
    name: option.name,
    price_adjustment: option.priceAdjustment,
  }));
}

function fromLegacyItem(item: LegacyCartItem): ContextCartItem {
  const selectedOptions = item.selectedOptions ?? [];
  return {
    cartItemId: item.id,
    menuItemId: item.menuItemId,
    itemSlug: slugify(item.name),
    itemName: item.name,
    imageUrl: null,
    quantity: clampCartQuantity(item.quantity),
    selectedOptionIds: selectedOptions.map((option) => option.id ?? ""),
    selectedOptionsForDisplay: selectedOptions.map((option) => ({
      group: option.group,
      name: option.name,
      priceAdjustment: Number(option.price_adjustment ?? 0),
    })),
    notes: item.notes ?? "",
    estimatedUnitPrice: Number(item.price ?? 0),
    estimatedLineTotal: Number(item.price ?? 0) * clampCartQuantity(item.quantity),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const legacyItems = useLegacyCart((state) => state.items);
  const legacyAddItem = useLegacyCart((state) => state.addItem);
  const legacyRemoveItem = useLegacyCart((state) => state.removeItem);
  const legacyUpdateQuantity = useLegacyCart((state) => state.updateQuantity);
  const legacyClear = useLegacyCart((state) => state.clear);

  const isOpen = useCartUI((state) => state.drawerOpen);
  const setDrawerOpen = useCartUI((state) => state.setDrawerOpen);

  const items = useMemo(() => legacyItems.map(fromLegacyItem), [legacyItems]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + clampCartQuantity(item.quantity), 0),
    [items],
  );
  const estimatedSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.estimatedLineTotal, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      estimatedSubtotal,
      addItem: (item) => {
        const quantity = clampCartQuantity(item.quantity ?? 1);
        legacyAddItem({
          id: item.cartItemId,
          menuItemId: item.menuItemId,
          name: item.itemName,
          price: item.estimatedUnitPrice,
          quantity,
          notes: item.notes,
          selectedOptions: toLegacySelectedOptions(item.selectedOptionsForDisplay, item.selectedOptionIds),
          optionLabel: item.selectedOptionsForDisplay.map((option) => `${option.group}: ${option.name}`).join(" · "),
        });
      },
      removeItem: (cartItemId) => legacyRemoveItem(cartItemId),
      updateQuantity: (cartItemId, quantity) => {
        legacyUpdateQuantity(cartItemId, clampCartQuantity(quantity));
      },
      updateItemOptions: (cartItemId, selectedOptionIds, selectedOptionsForDisplay, estimatedUnitPrice) => {
        useLegacyCart.setState((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId
              ? {
                  ...item,
                  price: estimatedUnitPrice,
                  selectedOptions: toLegacySelectedOptions(selectedOptionsForDisplay, selectedOptionIds),
                  optionLabel: selectedOptionsForDisplay
                    .map((option) => `${option.group}: ${option.name}`)
                    .join(" · "),
                }
              : item,
          ),
        }));
      },
      updateItemNotes: (cartItemId, notes) => {
        useLegacyCart.setState((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId
              ? {
                  ...item,
                  notes,
                }
              : item,
          ),
        }));
      },
      clearCart: () => legacyClear(),
      openCart: () => setDrawerOpen(true),
      closeCart: () => setDrawerOpen(false),
      toggleCart: () => setDrawerOpen(!isOpen),
      isOpen,
    }),
    [estimatedSubtotal, isOpen, itemCount, items, legacyAddItem, legacyClear, legacyRemoveItem, legacyUpdateQuantity, setDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}
