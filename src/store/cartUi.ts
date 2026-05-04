import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FlyingItem = {
  id: number;
  name: string;
  from: { x: number; y: number };
};

type CartUIState = {
  drawerOpen: boolean;
  setDrawerOpen: (o: boolean) => void;

  autoOpenOnAdd: boolean;
  setAutoOpenOnAdd: (v: boolean) => void;

  // DOM target rects for flying animations
  desktopCartRect: DOMRect | null;
  mobileCartRect: DOMRect | null;
  setDesktopCartRect: (r: DOMRect | null) => void;
  setMobileCartRect: (r: DOMRect | null) => void;

  // Pulse counter (incremented every add)
  pulseKey: number;

  // Flying items queue
  flying: FlyingItem[];
  fly: (payload: { name: string; from: { x: number; y: number } }) => void;
  removeFlying: (id: number) => void;
};

let flyId = 0;

export const useCartUI = create<CartUIState>()(
  persist(
    (set, get) => ({
      drawerOpen: false,
      setDrawerOpen: (o) => set({ drawerOpen: o }),

      autoOpenOnAdd: false,
      setAutoOpenOnAdd: (v) => set({ autoOpenOnAdd: v }),

      desktopCartRect: null,
      mobileCartRect: null,
      setDesktopCartRect: (r) => set({ desktopCartRect: r }),
      setMobileCartRect: (r) => set({ mobileCartRect: r }),

      pulseKey: 0,
      flying: [],
      fly: ({ name, from }) => {
        const id = ++flyId;
        set((s) => ({
          flying: [...s.flying, { id, name, from }],
          pulseKey: s.pulseKey + 1,
        }));
        if (get().autoOpenOnAdd) {
          // Delay open until flying animation completes
          setTimeout(() => set({ drawerOpen: true }), 700);
        }
      },
      removeFlying: (id) =>
        set((s) => ({ flying: s.flying.filter((f) => f.id !== id) })),
    }),
    {
      name: "asq-cart-ui",
      partialize: (s) => ({ autoOpenOnAdd: s.autoOpenOnAdd }),
    },
  ),
);
